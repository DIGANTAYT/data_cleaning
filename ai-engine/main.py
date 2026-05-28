from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import json
import urllib.request
import urllib.parse
from dotenv import load_dotenv
from cleaner import detect_issues, apply_cleaning
from copilot import ask_copilot
from ml_engine import train_auto_model

load_dotenv()

def ensure_local_file(file_path: str) -> str:
    # If the file path is already a full URL, download it
    if file_path.startswith("http://") or file_path.startswith("https://"):
        local_dir = os.path.join(os.path.dirname(__file__), "temp_uploads")
        os.makedirs(local_dir, exist_ok=True)
        parsed_url = urllib.parse.urlparse(file_path)
        filename = os.path.basename(parsed_url.path)
        local_path = os.path.join(local_dir, filename)
        
        print(f"Downloading remote dataset from {file_path} to {local_path}...")
        req = urllib.request.Request(
            file_path, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response, open(local_path, 'wb') as out_file:
            out_file.write(response.read())
        return local_path
        
    # Otherwise, resolve absolute path relative to the backend directory (local mode)
    return os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "backend", file_path))

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
