import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import sys
import os
import json 
#import warnings

#warnings.filterwarnings("ignore", category=UserWarning, module="sklearn.preprocessing._discretization")

csv_file = sys.argv[1]
strategy = sys.argv[2]
target_class = sys.argv[3]
selected_columns = sys.argv[4:]

data = pd.read_csv(csv_file, sep=";", quotechar='"')

if len(data.columns) == 1:
    data = pd.read_csv(csv_file, sep=",", quotechar='"')

selected_columns = list(map(str.strip, selected_columns))

#print("Dataset columns:\n", data.columns)
#print("Selected columns:\n", selected_columns)

X = data.loc[:, selected_columns]
y = data[target_class]

#print("X:\n", X)

#print("y:\n", y)

best_accuracy = 0
best_bin_number = 0
best_binned_dataset = None

for n_bins in range(2, 21):
    kbins = KBinsDiscretizer(n_bins=n_bins, encode='ordinal', strategy=strategy, subsample=None)
    X_binned = kbins.fit_transform(X)

    X_binned = X_binned.astype(int)

    data[selected_columns] = X_binned

    #print("X_binned :\n", X_binned)
    #print("data[selected_columns] :\n", data[selected_columns])
    #print("data :\n", data)

    V = data.drop(target_class, axis=1)
    #print("V :\n", V)

    X_train, X_test, y_train, y_test = train_test_split(
        V, y, test_size=0.33, random_state=125
    )

    nb_classifier = GaussianNB()

    nb_classifier.fit(X_train, y_train)

    y_pred = nb_classifier.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    #print("accuracy :\n", accuracy)

    if accuracy >= best_accuracy:
        best_accuracy = accuracy
        best_bin_number = n_bins
        best_binned_dataset = data[selected_columns].copy()

data[selected_columns] = best_binned_dataset

result = {
    "best_bin_number": best_bin_number,
    "best_accuracy": best_accuracy
}

print(json.dumps(result))

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"
os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

data.to_csv(output_file, index=False)

#print("Success: dataset saved to", output_file)
