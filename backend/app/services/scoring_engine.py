"""
Symptom scoring and red flag detection service for MyHealthMate
"""
import json
import os
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
KB_PATH = os.path.join(DATA_DIR, 'knowledge_base.json')
RED_FLAGS_PATH = os.path.join(DATA_DIR, 'red_flags.json')

# Load knowledge base
with open(KB_PATH, 'r', encoding='utf-8') as f:
    knowledge_base = json.load(f)

# Load red flags
with open(RED_FLAGS_PATH, 'r', encoding='utf-8') as f:
    red_flags = json.load(f)

def bayesian_score(user_symptoms: List[str], group: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Calculate posterior scores for each cause in a symptom group.
    """
    results = []
    for cause in group['causes']:
        prior = cause.get('prior', 0.01)
        likelihoods = cause.get('symptom_likelihoods', {})
        # Product of likelihoods for reported symptoms
        product = 1.0
        for symptom in user_symptoms:
            product *= likelihoods.get(symptom, 0.01)  # Use small value if not present
        posterior = prior * product
        results.append({
            'id': cause['id'],
            'name': cause['name'],
            'score': posterior,
            'tests': cause.get('tests', []),
            'triage_level': cause.get('triage_level', 'GP'),
        })
    # Normalize scores to get confidence
    total = sum(r['score'] for r in results)
    for r in results:
        r['confidence'] = r['score'] / total if total > 0 else 0.0
    # Sort by confidence descending
    results.sort(key=lambda x: x['confidence'], reverse=True)
    return results

def check_red_flags(user_symptoms: List[str]) -> List[str]:
    """
    Check user symptoms against red flag criteria.
    Returns list of emergency messages if any criteria met.
    """
    warnings = []
    for entry in red_flags.get('red_flags', []):
        main_symptom = entry['symptom']
        if main_symptom in user_symptoms:
            for cond in entry['conditions']:
                count = sum(1 for c in cond['criteria'] if c in user_symptoms)
                if count >= cond['threshold']:
                    warnings.append(cond['message'])
    return warnings

def analyze_symptoms(user_symptoms: List[str]) -> Dict[str, Any]:
    """
    Main entrypoint: returns ranked causes, tests, triage, and red flag warnings.
    """
    # Normalize input symptoms for matching
    normalized_symptoms = set(s.replace(' ', '_').lower() for s in user_symptoms)
    matched_group = None
    for group in knowledge_base.get('symptom_groups', []):
        # Normalize group name to symptom format
        group_names = [g.strip().replace(' ', '_').lower() for g in group['group'].replace('+', ',').split(',')]
        if any(gs in normalized_symptoms for gs in group_names):
            matched_group = group
            break
    if not matched_group:
        return {'causes': [], 'warnings': ['No matching symptom group found.']}
    # Bayesian scoring
    results = bayesian_score(list(normalized_symptoms), matched_group)
    # Red flag detection
    warnings = check_red_flags(list(normalized_symptoms))
    return {
        'causes': results,
        'warnings': warnings
    }
