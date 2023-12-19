import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import sys
import os
import json 
import warnings

warnings.filterwarnings("ignore")

csv_file = sys.argv[1]
bins = int(sys.argv[2])
target_class = sys.argv[3]
selected_columns = sys.argv[4:] 

data = pd.read_csv(csv_file, sep=";", quotechar='"')

if len(data.columns) == 1:
    data = pd.read_csv(csv_file, sep=",", quotechar='"')

selected_columns = list(map(str.strip, selected_columns))

X = data.loc[:, selected_columns]
y = data[target_class]

best_accuracy = 0
best_strategy = ''
best_binned_dataset = None

for strategy in ['uniform', 'quantile', 'kmeans']:
    kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=strategy, subsample=None)
    X_binned = kbins.fit_transform(X)
    
    X_binned = X_binned.astype(int)

    data[selected_columns] = X_binned

    V = data.drop(target_class, axis=1)

    X_train, X_test, y_train, y_test = train_test_split(
        V, y, test_size=0.33, random_state=125
    )

    nb_classifier = GaussianNB()

    nb_classifier.fit(X_train, y_train)

    y_pred = nb_classifier.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_strategy = strategy
        best_binned_dataset = data[selected_columns].copy()

data[selected_columns] = best_binned_dataset

best_accuracy = round(best_accuracy, 4)

print(json.dumps({"best_accuracy": best_accuracy, "best_strategy": best_strategy, "script": "auto_strategy"}))

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"
os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

data.to_csv(output_file, index=False)
