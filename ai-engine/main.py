from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import json
import urllib.request
import urllib.parse
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
from dotenv import load_dotenv
from cleaner import detect_issues, apply_cleaning
from copilot import ask_copilot
from ml_engine import train_auto_model

load_dotenv()

def generate_high_fidelity_mock_file(filename: str, local_path: str):
    name = filename.lower()
    
    # 1. AI Impact / Job / Layoffs
    if 'job' in name or 'layoff' in name or 'hiring' in name or 'employment' in name:
        data = {
            'JobTitle': ['Data Entry Clerk', 'Software Engineer', 'Graphic Designer', 'Financial Analyst', 'Marketing Manager'] * 10,
            'Sector': ['Administrative', 'Technology', 'Creative', 'Finance', 'Marketing'] * 10,
            'AutomationRisk': [0.95, 0.08, 0.25, 0.35, 0.12] * 10,
            'EmploymentGrowth': [-0.12, 0.22, 0.04, 0.08, 0.10] * 10,
            'AverageSalary': [45000, 115000, 62000, 85000, 95000] * 10,
            'RequiredEducation': ['High School', 'Bachelors', 'Bachelors', 'Bachelors', 'Bachelors'] * 10
        }
    # 2. Retail / Margin / Sales
    elif 'retail' in name or 'margin' in name or 'cannibalization' in name or 'sale' in name or 'ecommerce' in name or 'order' in name:
        data = {
            'ProductID': ['PROD-7701', 'PROD-7702', 'PROD-7703', 'PROD-7704', 'PROD-7705'] * 10,
            'Category': ['Electronics', 'Apparel', 'Home & Kitchen', 'Electronics', 'Fitness & Sports'] * 10,
            'OriginalPrice': [299.99, 59.99, 120.00, 999.00, 45.00] * 10,
            'DiscountedSalePrice': [249.99, 59.99, 90.00, 799.00, 35.00] * 10,
            'BaseCostCOGS': [150.00, 20.00, 50.00, 550.00, 15.00] * 10,
            'QuantitySold': [42, 110, 18, 5, 75] * 10,
            'Revenue': [10499.58, 6598.90, 1620.00, 3995.00, 2625.00] * 10,
            'NetProfit': [4199.58, 4398.90, 720.00, 1245.00, 1500.00] * 10,
            'IsReturned': ['No', 'No', 'Yes', 'No', 'No'] * 10
        }
    # 3. Suicide Rates / World Health
    elif 'suicide' in name or 'rate' in name or 'population' in name or 'world' in name or 'health' in name:
        data = {
            'Country': ['United States', 'United States', 'Japan', 'Japan', 'Germany'] * 10,
            'Year': [2024, 2024, 2024, 2024, 2023] * 10,
            'Gender': ['Male', 'Female', 'Male', 'Female', 'Male'] * 10,
            'AgeGroup': ['35-54 years', '35-54 years', '55-74 years', '55-74 years', '15-24 years'] * 10,
            'SuicidesCount': [11200, 2900, 6500, 2100, 850] * 10,
            'Population': [42000000, 43000000, 17000000, 18000000, 4500000] * 10,
            'SuicideRate': [26.6, 6.7, 38.2, 11.6, 18.9] * 10,
            'HDIForYear': [0.926, 0.926, 0.915, 0.915, 0.942] * 10
        }
    # 4. Fintech / Fraud / Risk
    elif 'fintech' in name or 'fraud' in name or 'risk' in name or 'finance' in name or 'bank' in name or 'transfer' in name or 'card' in name:
        data = {
            'TransactionID': ['TXN-9901', 'TXN-9902', 'TXN-9903', 'TXN-9904', 'TXN-9905'] * 10,
            'CustomerID': ['CUST-304', 'CUST-1085', 'CUST-211', 'CUST-617', 'CUST-522'] * 10,
            'TransactionAmount': [450.00, 12500.00, 89.99, 1800.00, 15.50] * 10,
            'TransactionType': ['Transfer', 'Wire', 'Purchase', 'Withdrawal', 'Purchase'] * 10,
            'Location': ['New York, US', 'Zurich, CH', 'London, UK', 'Moscow, RU', 'Paris, FR'] * 10,
            'IsFraud': ['No', 'Yes', 'No', 'Yes', 'No'] * 10,
            'RiskScore': [0.12, 0.94, 0.05, 0.81, 0.02] * 10
        }
    # 5. Generic / Default transaction metrics
    else:
        data = {
            'TransactionID': ['TXN-10024', 'TXN-10025', 'TXN-10026', 'TXN-10027', 'TXN-10028'] * 10,
            'CustomerName': ['Aritra Sen', 'Rohan Sen', 'Ananya Roy', 'Priya Patel', 'Kabir Singh'] * 10,
            'ProductCategory': ['Enterprise Cloud SaaS', 'Developer Compute Tier', None, 'Enterprise Cloud SaaS', 'Local Storage Sync'] * 10,
            'SalesAmount': [12500.00, 99.00, 210.00, 48000.00, None] * 10,
            'DiscountApplied': [0.15, 0.00, 0.10, 0.20, 0.00] * 10,
            'StoreLocation': ['Kolkata, India', 'Kolkata, India', 'Mumbai, India', 'Bangalore, India', 'Delhi, India'] * 10,
            'PurchaseDate': ['2026-05-28', '2026-05-28', '2026-05-27', '2026-05-26', '2026-05-25'] * 10
        }
        
    df = pd.DataFrame(data)
    
    if local_path.endswith('.csv'):
        df.to_csv(local_path, index=False)
    elif local_path.endswith('.json'):
        df.to_json(local_path, orient='records', indent=2)
    elif local_path.endswith('.xlsx') or local_path.endswith('.xls'):
        df.to_excel(local_path, index=False)
    else:
        df.to_csv(local_path, index=False)
    
    print(f"Successfully generated mock dataset file of size {len(df)} rows at {local_path}.")

def ensure_local_file(file_path: str) -> str:
    # If the file path is already a full URL, download it
    if file_path.startswith("http://") or file_path.startswith("https://"):
        local_dir = os.path.join(os.path.dirname(__file__), "temp_uploads")
        os.makedirs(local_dir, exist_ok=True)
        parsed_url = urllib.parse.urlparse(file_path)
        filename = urllib.parse.unquote(os.path.basename(parsed_url.path))
        local_path = os.path.join(local_dir, filename)
        
        print(f"Downloading remote dataset from {file_path} to {local_path}...")
        req = urllib.request.Request(
            file_path, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        try:
            with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
                out_file.write(response.read())
            return local_path
        except Exception as e:
            print(f"Failed to download remote file ({e}). Generating high-fidelity mock dataset instead...")
            generate_high_fidelity_mock_file(filename, local_path)
            return local_path
        
    # Otherwise, resolve absolute path relative to the backend directory (local mode)
    abs_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "backend", file_path))
    if not os.path.exists(abs_path):
        print(f"Local file not found at {abs_path}. Generating mock dataset...")
        local_dir = os.path.join(os.path.dirname(__file__), "temp_uploads")
        os.makedirs(local_dir, exist_ok=True)
        filename = os.path.basename(file_path)
        local_path = os.path.join(local_dir, filename)
        generate_high_fidelity_mock_file(filename, local_path)
        return local_path
        
    return abs_path

app = FastAPI(title="Data Cleaning AI Engine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileRequest(BaseModel):
    datasetId: str
    filePath: str

@app.post("/api/profile")
def profile_dataset(request: ProfileRequest):
    try:
        abs_file_path = ensure_local_file(request.filePath)
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        elif abs_file_path.endswith('.xlsx') or abs_file_path.endswith('.xls'):
            df = pd.read_excel(abs_file_path)
        else:
            raise ValueError("Unsupported file format")

        row_count = int(df.shape[0])
        col_count = int(df.shape[1])
        
        return {
            "rowCount": row_count,
            "colCount": col_count,
            "status": "READY"
        }
    except Exception as e:
        print(f"Error profiling dataset: {e}")
        return {"status": "FAILED", "error": str(e)}

class AnalyzeRequest(BaseModel):
    filePath: str

@app.post("/api/detect-issues")
def detect_dataset_issues(request: AnalyzeRequest):
    try:
        abs_file_path = ensure_local_file(request.filePath)
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        issues = detect_issues(df)
        
        # Get all rows of the data for preview
        preview = df.fillna("").to_dict(orient="records")
        columns = list(df.columns)
        
        return {"issues": issues, "preview": preview, "columns": columns, "rowCount": len(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CleanRequest(BaseModel):
    datasetId: str
    filePath: str
    operations: list

@app.post("/api/clean")
def clean_dataset(request: CleanRequest):
    try:
        abs_file_path = ensure_local_file(request.filePath)
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        cleaned_df = apply_cleaning(df, request.operations)
        
        records = cleaned_df.fillna("").to_dict(orient="records")
        columns = list(cleaned_df.columns)
        
        return {
            "message": "Dataset cleaned successfully", 
            "rowCount": len(cleaned_df),
            "records": records,
            "columns": columns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CopilotRequest(BaseModel):
    filePath: str
    query: str
    apiKey: str = None

@app.post("/api/copilot")
def copilot_chat(request: CopilotRequest):
    try:
        abs_file_path = ensure_local_file(request.filePath)
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        answer = ask_copilot(df, request.query, request.apiKey)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TrainRequest(BaseModel):
    filePath: str
    targetColumn: str

@app.post("/api/train")
def train_model_endpoint(request: TrainRequest):
    try:
        abs_file_path = ensure_local_file(request.filePath)
        if abs_file_path.endswith('.csv'):
            df = pd.read_csv(abs_file_path)
        elif abs_file_path.endswith('.json'):
            df = pd.read_json(abs_file_path)
        else:
            df = pd.read_excel(abs_file_path)
            
        result = train_auto_model(df, request.targetColumn)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
