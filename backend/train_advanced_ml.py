import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier # Καλύτερο από Logistic Regression
import joblib

df = pd.read_csv("scenario_realism.csv")

# Features: Θερμοκρασία, Φορτίο Συντάγματος, Φορτίο Κυψέλης
X = df[['temp_ambient', 'load_syntagma', 'load_kypseli']]
y = df['risk_label']

# Random Forest για να πιάσει τις μη-γραμμικές σχέσεις
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

joblib.dump(model, "advanced_brain.pkl")
print("🧠 Advanced AI Brain Trained & Saved.")