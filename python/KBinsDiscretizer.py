import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
import sys
import os

csv_file = sys.argv[1]
strategy = sys.argv[2]
bins = int(sys.argv[3])
selected_columns = sys.argv[4:]

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

kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=strategy)
X_binned = kbins.fit_transform(X)

print("Original dataset:\n", data)
print("\nBinned dataset:\n", pd.DataFrame(X_binned, columns=selected_columns))

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"

os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv") 

binned_df = pd.DataFrame(X_binned, columns=selected_columns)

binned_df.to_csv(output_file, index=False)

# Print a success message
print("Success: Binned dataset saved to", output_file)
