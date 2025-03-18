import joblib
import pandas as pd
from flask import Flask, render_template, request
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
import pandas as pd
from datetime import datetime

app = Flask(__name__)

# Load models and scaler
model = load_model('best_model.keras')
encoder = load_model('encoder.keras')
scaler = joblib.load('scaler.joblib')

# Transaction types (adjust based on training data)
TRANSACTION_TYPES = ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']

@app.route('/')
def home():
    """Render the home page"""
    return render_template('home.html')

@app.route('/analyze')
def analyze():
    """Render the analysis form page"""
    return render_template('analyze.html', transaction_types=TRANSACTION_TYPES)

@app.route('/about')
def about():
    return render_template('aboutus.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from AJAX request
        data = request.get_json()
        
        # Create DataFrame from input data
        df = pd.DataFrame([data])

        # Feature Engineering
        df['isMerchant'] = df['nameDest'].str.startswith('M').astype(int)
        df['amount_to_oldbalanceOrg_ratio'] = df['amount'] / (df['oldbalanceOrg'] + 1e-5)
        df['hour'] = df['step'] % 24
        df['day'] = df['step'] // 24
        
        # One-hot encoding
        for t_type in TRANSACTION_TYPES[1:]:
            df[f'type_{t_type}'] = (df['type'] == t_type).astype(int)
        
        # Additional features
        df['zero_start_balance'] = (df['oldbalanceOrg'] == 0).astype(int)
        df['large_transfer_flag'] = (df['amount'] > 200000).astype(int)
        df['daily_transaction_sum'] = df['amount']  # Simplified for demo

        # Drop unused columns
        df.drop(['nameDest', 'type'], axis=1, inplace=True)

        # Ensure correct column order (update based on your model)
        expected_columns = [
            'step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest',
            'newbalanceDest', 'isMerchant', 'amount_to_oldbalanceOrg_ratio',
            'hour', 'day', 'type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT',
            'type_TRANSFER', 'zero_start_balance', 'large_transfer_flag',
            'daily_transaction_sum'
        ]
        df = df.reindex(columns=expected_columns, fill_value=0)

        # Preprocess
        scaled = scaler.transform(df)
        encoded = encoder.predict(scaled)
        
        # Reshape for model input
        sequence_length = 32
        n_features = encoded.shape[1] // sequence_length
        encoded_reshaped = encoded[:, :sequence_length*n_features].reshape(-1, sequence_length, n_features)

        # Predict
        prob = model.predict(encoded_reshaped)[0][0]
        prediction = 'Fraudulent' if prob > 0.5 else 'Not Fraudulent'

        return jsonify({
            'prediction': prediction,
            'probability': round(prob * 100, 2),
            'amount': float(data['amount']),
            'type': data['type'],
            'nameDest': data['nameDest']
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 400

@app.route('/contactus')
def contact():
    return render_template('contact.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

# Add POST handlers for form submissions
@app.route('/submit-contact', methods=['POST'])
def submit_contact():
    # Handle contact form submission
    pass

@app.route('/login', methods=['POST'])
def handle_login():
    # Handle login logic
    pass

@app.route('/signup', methods=['POST'])
def handle_signup():
    # Handle signup logic
    pass

@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

if __name__ == '__main__':
    app.run(debug=True)