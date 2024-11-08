# AutoDiscretizer

AutoDiscretizer is a web application built with Python, leveraging the KBinsDiscretizer from Scikit-Learn. The application allows users to quickly and effectively discretize continuous data into categorical bins, which can help improve the interpretability of numerical features and prepare data for machine learning models

### Features

- **User-Friendly Interface**: Upload your dataset and navigate through the discretization steps with a simple interface that’s accessible for users of all experience levels.

- **Column Selection**: Choose specific columns to discretize, giving you full control and flexibility over which features to preprocess.

- **Strategy Selection**: Tailor the binning process to your specific needs with a variety of strategies:
  - **Uniform**: Equal-width binning for evenly distributed bins.
  - **Quantile**: Equal-sized bins based on data distribution quantiles.
  - **KMeans**: Uses clustering to find optimal bins based on natural data clusters.

- **Manual Binning**: Set the number of bins for each selected column to achieve your desired level of data granularity.

- **Auto Options**: Let AutoDiscretizer automate binning! Using machine learning, specifically Naive Bayes, the app can automatically determine the optimal number of bins or strategy based on accuracy, helping you streamline your preprocessing without compromising on precision.

## Visit the AutoDiscretizer Web Application 🚀

**[AutoDiscretizer](https://kclusterhub.iee.ihu.gr/autodiscretizer/)**

Experience the simplicity of data discretization with our web application.

