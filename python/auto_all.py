import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import sys
import os

csv_file = sys.argv[1]
target_class = sys.argv[2]
selected_columns = sys.argv[3:]  # these are the column names to do KBinsDiscretizer

# Read the CSV file with semicolon as the default separator
data = pd.read_csv(csv_file, sep=";", quotechar='"')

# Check if the DataFrame has more than one column
if len(data.columns) == 1:
    # If only one column is present, try reading with a comma separator
    data = pd.read_csv(csv_file, sep=",", quotechar='"')

selected_columns = list(map(str.strip, selected_columns))

print("Dataset columns:\n", data.columns)
print("Selected columns:\n", selected_columns)

X = data.loc[:, selected_columns]
y = data[target_class]

print("X:\n", X)
print("y:\n", y)

# Initialize variables to track the best accuracy and corresponding strategy
best_accuracy = 0
best_strategy = ''
best_binned_dataset = None
best_num_bins = 0

# Loop through different numbers of bins
for bins in range(2, 11):  # You can adjust the range as needed
    # Loop through different strategies
    for strategy in ['uniform', 'quantile', 'kmeans']:
        kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=strategy, subsample=1000)
        X_binned = kbins.fit_transform(X)

        # Replace the original columns with the best-binned columns in the same positions
        data[selected_columns] = X_binned

        V = data.drop(target_class, axis=1)

        X_train, X_test, y_train, y_test = train_test_split(
            V, y, test_size=0.33, random_state=125
        )

        nb_classifier = GaussianNB()

        nb_classifier.fit(X_train, y_train)

        # Make predictions on the test set
        y_pred = nb_classifier.predict(X_test)

        # Calculate accuracy
        accuracy = accuracy_score(y_test, y_pred)

        print("accuracy for strategy", strategy, "and bins", bins, ":\n", accuracy)

        # Update best accuracy, strategy, and number of bins
        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_strategy = strategy
            best_binned_dataset = data[selected_columns].copy()
            best_num_bins = bins

# Save the dataset with the best accuracy
data[selected_columns] = best_binned_dataset

print("Best strategy:", best_strategy)
print("Best accuracy:", best_accuracy)
print("Best number of bins:", best_num_bins)

print("data :\n", data)

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"
os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

data.to_csv(output_file, index=False)

# Print a success message
print("Success: dataset saved to", output_file)
