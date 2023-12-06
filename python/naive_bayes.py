import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import sys
import json

csv_file = sys.argv[1]
bins = int(sys.argv[2])
selected_columns = sys.argv[3:]
selected_columns = list(map(str.strip, selected_columns))

data = pd.read_csv(csv_file, sep=";")

X = data.loc[:, selected_columns]
y = data.iloc[:, -1]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.33, random_state=125, stratify=y
)

kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy='uniform')
X_train_binned = kbins.fit_transform(X_train)
X_test_binned = kbins.transform(X_test)

model = GaussianNB()

model.fit(X_train_binned, y_train)

y_pred = model.predict(X_test_binned)

accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average="weighted")
precision = precision_score(y_test, y_pred, average="weighted", zero_division=1)
recall = recall_score(y_test, y_pred, average="weighted")

print(json.dumps({"Accuracy": accuracy, "F1 Score": f1, "Precision": precision, "Recall": recall}))
