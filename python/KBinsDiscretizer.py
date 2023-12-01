import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
from sklearn.naive_bayes import GaussianNB
import sys
import os

csv_file = sys.argv[1]

data = pd.read_csv(csv_file, sep=";")

selected_columns  = sys.argv[2:]
selected_columns  = list(map(str.strip, selected_columns ))

X = data.loc[:, selected_columns]

kbins = KBinsDiscretizer(n_bins=3, encode='ordinal', strategy='quantile')
X_binned = kbins.fit_transform(X)

print("Original dataset:\n", data)
print("\nBinned dataset:\n", pd.DataFrame(X_binned, columns=selected_columns))

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"

os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv")

binned_df = pd.DataFrame(X_binned, columns=selected_columns)

binned_df.to_csv(output_file, index=False)

