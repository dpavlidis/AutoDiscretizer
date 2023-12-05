import pandas as pd
import sys
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score


# Load your dataset
csv_file = sys.argv[1]
data = pd.read_csv(csv_file, sep=",")

print(data)

# Assuming your target class column is named 'target_class'
# Adjust this based on your actual column name
target_class_column = 'Class'

# Separate features (X) and target class (y)
X = data.drop(target_class_column, axis=1)
y = data[target_class_column]

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=125)

# Create a Gaussian Naive Bayes classifier
model = GaussianNB()

# Train the model
model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print(f"Accuracy: {accuracy}")

