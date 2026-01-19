import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier # Better than Logistic Regression
import joblib

df = pd.read_csv("scenario_realism.csv")

# Features: Temperature, Syntagma Load, Kypseli Load
X = df[['temp_ambient', 'load_syntagma', 'load_kypseli']]
y = df['risk_label']

# Random Forest to capture non-linear relationships
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

joblib.dump(model, "advanced_brain.pkl")
print("🧠 Advanced AI Brain Trained & Saved.")