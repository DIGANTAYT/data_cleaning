import pandas as pd
import os
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

def local_data_analyzer(df: pd.DataFrame, query: str, context_message: str = "") -> str:
    q = query.lower()
    
    # 1. Null / Missing Analysis
    if any(k in q for k in ["null", "missing", "nan", "empty"]):
        missing = df.isnull().sum()
        pct = (df.isnull().sum() / len(df)) * 100
        null_df = pd.DataFrame({"Missing Count": missing, "Percentage (%)": pct.round(2)})
        null_df = null_df[null_df["Missing Count"] > 0]
        if null_df.empty:
            return f"🎉 **Local Copilot Analysis:** I analyzed the dataset and found **0 missing values**! Every single column is 100% complete."
        return (
            f"🔍 **Local Copilot Analysis:** Here is the report of missing values in your dataset:\n\n"
            f"{null_df.to_markdown()}\n\n"
            f"**Recommendation:** You can use the 'Clean' tab to impute these missing values or drop columns with high missing ratios."
        )

    # 2. Descriptive Stats / Summary
    if any(k in q for k in ["summary", "describe", "profile", "stats"]):
        desc = df.describe(include='all').fillna('-')
        return (
            f"📊 **Local Copilot Statistical Summary:**\n\n"
            f"{desc.to_markdown()}\n\n"
            f"This summary shows the key metrics (mean, min, max, standard deviation) for all columns."
        )

    # 3. Correlation Matrix
    if any(k in q for k in ["correlation", "correlate", "relation"]):
        num_df = df.select_dtypes(include=['number'])
        if num_df.shape[1] < 2:
            return "⚠️ **Local Copilot Analysis:** Correlation requires at least two numeric fields, but this dataset only has one."
        corr = num_df.corr().round(3)
        return (
            f"🔗 **Local Copilot Correlation Matrix:**\n\n"
            f"{corr.to_markdown()}\n\n"
            f"Values close to 1 or -1 indicate strong positive or negative linear relationships."
        )

    # 4. Column List / Shapes
    if any(k in q for k in ["column", "variable", "feature", "shape", "size"]):
        dtypes_df = pd.DataFrame({"Data Type": df.dtypes.astype(str), "Non-Null Count": df.notnull().sum()})
        return (
            f"📁 **Local Copilot Schema Report:**\n\n"
            f"- **Rows:** {df.shape[0]} | **Columns:** {df.shape[1]}\n\n"
            f"**Field Details:**\n"
            f"{dtypes_df.to_markdown()}"
        )

    # 5. Specific Column operations (e.g. "average of Age", "sum of Income")
    matched_col = None
    for c in df.columns:
        if c.lower() in q:
            matched_col = c
            break
            
    if matched_col:
        col_data = df[matched_col]
        if pd.api.types.is_numeric_dtype(col_data):
            if any(k in q for k in ["average", "mean"]):
                val = col_data.mean()
                return f"📈 **Local Copilot Calculation:** The **average (mean)** of `{matched_col}` is **{round(val, 4)}**."
            if "sum" in q:
                val = col_data.sum()
                return f"📈 **Local Copilot Calculation:** The **sum** of `{matched_col}` is **{round(val, 4)}**."
            if "median" in q:
                val = col_data.median()
                return f"📈 **Local Copilot Calculation:** The **median** of `{matched_col}` is **{round(val, 4)}**."
            if "max" in q:
                val = col_data.max()
                return f"📈 **Local Copilot Calculation:** The **maximum value** in `{matched_col}` is **{val}**."
            if "min" in q:
                val = col_data.min()
                return f"📈 **Local Copilot Calculation:** The **minimum value** in `{matched_col}` is **{val}**."
            if "std" in q or "deviation" in q:
                val = col_data.std()
                return f"📈 **Local Copilot Calculation:** The **standard deviation** of `{matched_col}` is **{round(val, 4)}**."
        else:
            if any(k in q for k in ["unique", "distinct"]):
                val = col_data.nunique()
                vals = col_data.unique()[:10]
                return (
                    f"🔤 **Local Copilot Analysis:** Column `{matched_col}` has **{val} unique values**.\n"
                    f"**Sample values:** {', '.join([str(v) for v in vals])}"
                )

    # 6. Default fallback rich analysis
    row_count = len(df)
    cols = list(df.columns)
    numeric_cols = list(df.select_dtypes(include=['number']).columns)
    categorical_cols = list(df.select_dtypes(exclude=['number']).columns)
    
    suggested_num = numeric_cols[0] if numeric_cols else "column"
    
    return (
        f"{context_message}"
        f"🤖 **Local Copilot Analysis:** I scanned the dataset for your query *\"{query}\"*.\n\n"
        f"**📊 Dataset Quick Stats:**\n"
        f"- **Rows:** {row_count} | **Columns:** {len(cols)}\n"
        f"- **Numeric fields:** {', '.join([f'`{n}`' for n in numeric_cols[:5]]) or 'None'}\n"
        f"- **Categorical fields:** {', '.join([f'`{c}`' for c in categorical_cols[:5]]) or 'None'}\n\n"
        f"💡 **Tip:** You can ask me specific questions like:\n"
        f"- *\"What is the average of {suggested_num}?\"*\n"
        f"- *\"Show me missing values\"*\n"
        f"- *\"Describe the dataset\"*\n"
        f"- *\"What is the correlation of numeric fields?\"*"
    )

def ask_copilot(df: pd.DataFrame, query: str, user_api_key: str = None) -> str:
    api_key = user_api_key or os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your-openai-api-key-here":
        return local_data_analyzer(
            df, 
            query, 
            context_message="💡 *Note: Using Local Data Explorer (no OpenAI API key configured).*\n\n"
        )

    try:
        # Detect Google Gemini developer API Key (Free tier)
        if api_key.startswith("AIzaSy"):
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=api_key,
                temperature=0
            )
        else:
            # We use a lower temperature for data analysis to keep it factual
            llm = ChatOpenAI(temperature=0, model="gpt-4o-mini", openai_api_key=api_key)
        
        # Create the LangChain Pandas Agent
        agent = create_pandas_dataframe_agent(
            llm, 
            df, 
            verbose=True, 
            allow_dangerous_code=True, # Required by LangChain for the Pandas agent
            agent_executor_kwargs={"handle_parsing_errors": True}
        )
        
        response = agent.invoke(query)
        return response.get('output', str(response))
    except Exception as e:
        print(f"Copilot Error: {e}")
        error_msg = str(e)
        if "insufficient_quota" in error_msg or "429" in error_msg:
            return local_data_analyzer(
                df, 
                query, 
                context_message="⚠️ **OpenAI API Quota Exceeded (429):** The configured API key has run out of credits.\n*Falling back to the Local Data Explorer to answer your question:*\n\n"
            )
        return f"An error occurred while analyzing the data: {str(e)}"
