import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import CategoricalNB
from sklearn.metrics import accuracy_score
import sys
import os
import json 
import warnings
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

csv_file = sys.argv[1]
bins = int(sys.argv[2])
target_class = sys.argv[3]
selected_columns = sys.argv[4:] 

data = pd.read_csv(csv_file, sep=",", quotechar='"')

if len(data.columns) == 1:
    data = pd.read_csv(csv_file, sep=";", quotechar='"')

selected_columns = list(map(str.strip, selected_columns))

non_numeric_columns = []

le = LabelEncoder()

for column in data.columns:
    if column != target_class and data[column].dtype not in ['int64', 'float64']:
        non_numeric_columns.append(column)

for column in non_numeric_columns:
    data[column] = le.fit_transform(data[column])

V = data.loc[:, non_numeric_columns]

X = data.loc[:, selected_columns]
y = data[target_class]

combined_data = pd.concat([V, X], axis=1)

if target_class in combined_data.columns:
    combined_data = combined_data.drop(target_class, axis=1)

best_accuracy = 0
best_strategy = ''
best_binned_dataset = None

X_train, X_test, y_train, y_test = train_test_split(combined_data, y, test_size=0.33, random_state=125)

for strategy in ['uniform', 'quantile', 'kmeans']:
    kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=strategy, subsample=None)
    
    X_train_binned = kbins.fit_transform(X_train)
    X_test_binned = kbins.transform(X_test)

    nb_classifier = CategoricalNB()
    nb_classifier.fit(X_train_binned, y_train)

    y_pred = nb_classifier.predict(X_test_binned)
    accuracy = accuracy_score(y_test, y_pred)

    if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_strategy = strategy
            best_binned_dataset = X_train_binned


kbins_best = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=best_strategy)
kbins_best.fit(data[selected_columns]) 

data_binned = kbins_best.transform(data[selected_columns])

for i, col in enumerate(selected_columns):
    data[col] = data_binned[:, i].astype(int)

best_accuracy = round(best_accuracy, 4)

print(json.dumps({"best_accuracy": best_accuracy, "best_strategy": best_strategy, "script": "auto_strategy"}))

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"
os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

data.to_csv(output_file, index=False)
