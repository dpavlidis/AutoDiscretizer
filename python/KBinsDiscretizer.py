import pandas as pd
from sklearn.preprocessing import KBinsDiscretizer
import sys
import os
import warnings

warnings.filterwarnings("ignore")

csv_file = sys.argv[1]
strategy = sys.argv[2]
bins = int(sys.argv[3])
selected_columns = sys.argv[4:]

data = pd.read_csv(csv_file, sep=",", quotechar='"')

if len(data.columns) == 1:
    data = pd.read_csv(csv_file, sep=";", quotechar='"')

selected_columns = list(map(str.strip, selected_columns))

X = data.loc[:, selected_columns]

kbins = KBinsDiscretizer(n_bins=bins, encode='ordinal', strategy=strategy)
X_binned = kbins.fit_transform(X)

X_binned = X_binned.astype(int).astype(str)

data[selected_columns] = X_binned

base_name = os.path.splitext(os.path.basename(csv_file))[0]

output_folder = "../binned_datasets"

os.makedirs(output_folder, exist_ok=True)

output_file = os.path.join(output_folder, f"{base_name}.csv") 

data.to_csv(output_file, index=False)

print("Binned dataset processing was successful")
