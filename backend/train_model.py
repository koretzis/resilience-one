import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib

# 1. Load Data
df = pd.read_csv("elpida_scenario.csv")

# 2. Features (X) & Target (y)
X = df[['temperature', 'grid_load']]
y = df['risk_label']

# 3. Train Model
model = LogisticRegression()
model.fit(X, y)

# 4. Save Model
joblib.dump(model, "failure_predictor.pkl")
print(f"✅ Model Trained! Accuracy: {model.score(X, y):.2f}")
print("🧠 Saved as 'failure_predictor.pkl'")