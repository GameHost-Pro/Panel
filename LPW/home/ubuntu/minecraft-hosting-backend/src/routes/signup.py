from flask import Blueprint, request, jsonify
from src.models.signup import db, Signup
from datetime import datetime, timedelta

signup_bp = Blueprint('signup', __name__)

@signup_bp.route('/signup', methods=['POST'])
def add_signup():
    try:
        data = request.get_json()
        email = data.get('email')
        country = data.get('country', 'US')
        currency = data.get('currency', 'USD')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if email already exists
        existing_signup = Signup.query.filter_by(email=email).first()
        if existing_signup:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new signup
        new_signup = Signup(
            email=email,
            country=country,
            currency=currency
        )
        
        db.session.add(new_signup)
        db.session.commit()
        
        # Get total count
        total_count = Signup.query.count()
        
        return jsonify({
            'message': 'Signup successful',
            'signup_number': total_count,
            'total_signups': total_count
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@signup_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    try:
        # Total signups
        total_signups = Signup.query.count()
        
        # Today's signups
        today = datetime.utcnow().date()
        today_signups = Signup.query.filter(
            db.func.date(Signup.created_at) == today
        ).count()
        
        # This week's signups
        week_ago = datetime.utcnow() - timedelta(days=7)
        week_signups = Signup.query.filter(
            Signup.created_at >= week_ago
        ).count()
        
        # Country distribution
        country_stats = db.session.query(
            Signup.country, 
            db.func.count(Signup.id).label('count')
        ).group_by(Signup.country).all()
        
        # MENA countries
        mena_countries = ['AE', 'SA', 'EG', 'TR', 'IL', 'BH', 'KW', 'QA', 'OM', 'JO', 'LB']
        mena_count = Signup.query.filter(Signup.country.in_(mena_countries)).count()
        mena_percentage = round((mena_count / total_signups * 100) if total_signups > 0 else 0, 1)
        
        return jsonify({
            'total_signups': total_signups,
            'today_signups': today_signups,
            'week_signups': week_signups,
            'mena_percentage': mena_percentage,
            'country_distribution': [{'country': c[0], 'count': c[1]} for c in country_stats]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@signup_bp.route('/admin/signups', methods=['GET'])
def get_all_signups():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        signups = Signup.query.order_by(Signup.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'signups': [signup.to_dict() for signup in signups.items],
            'total': signups.total,
            'pages': signups.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

