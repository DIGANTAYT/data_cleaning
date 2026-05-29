import pandas as pd
import numpy as np

def detect_issues(df: pd.DataFrame):
    issues = {
        "missing_values": {},
        "duplicates": 0,
        "outliers": {}
    }
    
    # Missing values
    missing = df.isnull().sum()
    for col, count in missing.items():
        if count > 0:
            issues["missing_values"][col] = int(count)
            
    # Duplicates
    issues["duplicates"] = int(df.duplicated().sum())
    
    # Outliers (using IQR for numeric columns)
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers_count = int(((df[col] < lower_bound) | (df[col] > upper_bound)).sum())
        if outliers_count > 0:
            issues["outliers"][col] = outliers_count
            
    return issues

def apply_cleaning(df: pd.DataFrame, operations: list):
    cleaned_df = df.copy()
    
    for op in operations:
        action = op.get("action")
        target = op.get("target")
        
        if action == "drop_duplicates":
            cleaned_df = cleaned_df.drop_duplicates()
        
        elif action == "fill_missing":
            strategy = op.get("strategy", "mean") # mean, median, mode, zero, drop
            if target in cleaned_df.columns:
                if strategy == "mean" or strategy == "median":
                    if pd.api.types.is_numeric_dtype(cleaned_df[target]):
                        val = cleaned_df[target].mean() if strategy == "mean" else cleaned_df[target].median()
                        cleaned_df[target] = cleaned_df[target].fillna(val)
                    else:
                        # Fallback for text/categorical columns when mean/median is requested by auto-clean
                        mode_series = cleaned_df[target].mode()
                        fallback_val = mode_series.iloc[0] if not mode_series.empty else "N/A"
                        cleaned_df[target] = cleaned_df[target].fillna(fallback_val)
                elif strategy == "mode":
                    mode_series = cleaned_df[target].mode()
                    fallback_val = mode_series.iloc[0] if not mode_series.empty else "N/A"
                    cleaned_df[target] = cleaned_df[target].fillna(fallback_val)
                elif strategy == "zero":
                    cleaned_df[target] = cleaned_df[target].fillna(0)
                elif strategy == "drop":
                    cleaned_df = cleaned_df.dropna(subset=[target])
                    
        elif action == "remove_outliers":
            if target in cleaned_df.columns and pd.api.types.is_numeric_dtype(cleaned_df[target]):
                Q1 = cleaned_df[target].quantile(0.25)
                Q3 = cleaned_df[target].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                # Exclude outliers while preserving NaN missing values in the same column
                cleaned_df = cleaned_df[
                    ((cleaned_df[target] >= lower_bound) & (cleaned_df[target] <= upper_bound)) | 
                    cleaned_df[target].isna()
                ]
                
    return cleaned_df
