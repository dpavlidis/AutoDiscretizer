import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import sys
import os

csv_file = sys.argv[1]
selected_columns = sys.argv[2:]  # these are the column names to do KBinsDiscretizer
target_class = 'Class'

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

# Initialize variables to track the best accuracy and corresponding bin number
best_accuracy = 0
best_bin_number = 0
best_binned_dataset = None

# Loop through different bin numbers
for n_bins in range(2, 21):
    kbins = KBinsDiscretizer(n_bins=n_bins, encode='ordinal', strategy='uniform', subsample=1000)
    X_binned = kbins.fit_transform(X)

    # Replace the original columns with the best-binned columns in the same positions
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

    # Make predictions on the test set
    y_pred = nb_classifier.predict(X_test)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)

    print("accuracy :\n", accuracy)

    # Update best accuracy and corresponding bin number
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_bin_number = n_bins
        best_binned_dataset = data[selected_columns].copy()

# Save the dataset with the best accuracy
data[selected_columns] = best_binned_dataset

print("Best bin number:", best_bin_number)
print("Best accuracy:", best_accuracy)

print("data :\n", data)

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "./binned_datasets"
os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

data.to_csv(output_file, index=False)

# Print a success message
print("Success: dataset saved to", output_file)
