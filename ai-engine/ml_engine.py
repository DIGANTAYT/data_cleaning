import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score
import numpy as np

def train_auto_model(df: pd.DataFrame, target_column: str, task_type: str = 'auto'):
    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset.")
        
    # Basic automated preprocessing
    df = df.dropna(subset=[target_column])
    
    # Identify task type
    if task_type == 'auto':
        if pd.api.types.is_numeric_dtype(df[target_column]) and df[target_column].nunique() > 10:
            task_type = 'regression'
        else:
            task_type = 'classification'
            
    # Drop non-numeric for MVP simplicity, or one-hot encode
    # For now, let's just select numeric features
    numeric_features = df.select_dtypes(include=[np.number]).drop(columns=[target_column], errors='ignore')
    
    # Fill remaining NaNs with mean
    numeric_features = numeric_features.fillna(numeric_features.mean())
    
    X = numeric_features
    y = df[target_column]
    
    if X.empty:
        raise ValueError("No numeric features available to train the model.")
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    result = {"task": task_type, "target": target_column, "features": list(X.columns)}
    
    if task_type == 'regression':
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        result["metrics"] = {"mse": mse, "rmse": float(np.sqrt(mse))}
    else:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        # Convert y to string if classification for safety
        y_train_c = y_train.astype(str)
        y_test_c = y_test.astype(str)
        model.fit(X_train, y_train_c)
        predictions = model.predict(X_test)
        acc = accuracy_score(y_test_c, predictions)
        result["metrics"] = {"accuracy": acc}
        
    # Feature importance
    importances = model.feature_importances_
    feature_importance = sorted(zip(X.columns, importances), key=lambda x: x[1], reverse=True)[:5]
    result["top_features"] = [{"feature": f, "importance": float(i)} for f, i in feature_importance]
    
    return result
