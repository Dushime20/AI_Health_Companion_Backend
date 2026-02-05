import * as tf from '@tensorflow/tfjs';
import { config } from '../config';
import { logger } from '../utils/logger';
import path from 'path';

export interface DiagnosisInput {
    symptoms: Array<{ name: string; category: string; severity?: string }>;
    vitalSigns: {
        temperature?: number;
        bloodPressureSystolic?: number;
        bloodPressureDiastolic?: number;
        heartRate?: number;
        respiratoryRate?: number;
        oxygenSaturation?: number;
    };
    age: number;
    gender: string;
    medicalHistory?: string[];
}

export interface Prediction {
    disease: string;
    confidence: number;
    icd10Code?: string;
    recommendations?: string[];
}

export class AIService {
    private model: tf.GraphModel | null = null;
    private diseaseLabels: string[] = [];
    private isModelLoaded: boolean = false;

    constructor() {
        this.initializeModel();
    }

    private async initializeModel(): Promise<void> {
        try {
            // In production, load the actual TensorFlow Lite model
            // For now, we'll use a mock implementation
            logger.info('Initializing AI model...');

            // Mock disease labels (in production, load from model metadata)
            this.diseaseLabels = [
                'Common Cold',
                'Influenza',
                'Malaria',
                'Typhoid Fever',
                'Pneumonia',
                'Tuberculosis',
                'Dengue Fever',
                'Hypertension',
                'Diabetes',
                'Gastroenteritis',
                'Urinary Tract Infection',
                'Skin Infection',
                'Respiratory Infection',
                'Anemia',
                'Dehydration'
            ];

            this.isModelLoaded = true;
            logger.info('AI model initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize AI model:', error);
            throw error;
        }
    }

    public async predictDisease(input: DiagnosisInput): Promise<Prediction[]> {
        try {
            if (!this.isModelLoaded) {
                await this.initializeModel();
            }

            // Preprocess input data
            // const features = this.preprocessInput(input);

            // In production, use actual model inference
            // const predictions = await this.model.predict(features);

            // Mock predictions for demonstration
            const predictions = this.mockPredict(input);

            // Filter by confidence threshold and get top predictions
            const filteredPredictions = predictions
                .filter(p => p.confidence >= config.aiModelConfidenceThreshold)
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, config.aiMaxPredictions);

            // Add recommendations
            const predictionsWithRecommendations = filteredPredictions.map(p => ({
                ...p,
                recommendations: this.getRecommendations(p.disease)
            }));

            logger.info(`AI prediction completed: ${predictionsWithRecommendations.length} diseases predicted`);

            return predictionsWithRecommendations;
        } catch (error) {
            logger.error('Error during disease prediction:', error);
            throw error;
        }
    }

    /*
    private preprocessInput(input: DiagnosisInput): number[] {
        // Convert input to feature vector
        const features: number[] = [];

        // Add vital signs (normalized)
        features.push(
            this.normalize(input.vitalSigns.temperature || 37, 35, 42),
            this.normalize(input.vitalSigns.bloodPressureSystolic || 120, 80, 200),
            this.normalize(input.vitalSigns.bloodPressureDiastolic || 80, 50, 120),
            this.normalize(input.vitalSigns.heartRate || 75, 40, 180),
            this.normalize(input.vitalSigns.respiratoryRate || 16, 10, 40),
            this.normalize(input.vitalSigns.oxygenSaturation || 98, 80, 100)
        );

        // Add age (normalized)
        features.push(this.normalize(input.age, 0, 100));

        // Add gender (one-hot encoded)
        features.push(input.gender === 'male' ? 1 : 0);
        features.push(input.gender === 'female' ? 1 : 0);

        // Add symptom features (simplified)
        const symptomCategories = ['respiratory', 'digestive', 'neurological', 'cardiovascular', 'general'];
        symptomCategories.forEach(category => {
            const hasSymptom = input.symptoms.some(s => s.category.toLowerCase() === category);
            features.push(hasSymptom ? 1 : 0);
        });

        return features;
    }

    private normalize(value: number, min: number, max: number): number {
        return (value - min) / (max - min);
    }
    */

    private mockPredict(input: DiagnosisInput): Prediction[] {
        // Mock prediction logic based on symptoms
        const predictions: Prediction[] = [];
        const symptomNames = input.symptoms.map(s => s.name.toLowerCase());

        // Simple rule-based mock predictions
        if (symptomNames.some(s => s.includes('fever') || s.includes('cough'))) {
            predictions.push({
                disease: 'Common Cold',
                confidence: 0.75,
                icd10Code: 'J00'
            });
            predictions.push({
                disease: 'Influenza',
                confidence: 0.68,
                icd10Code: 'J11'
            });
        }

        if (input.vitalSigns.temperature && input.vitalSigns.temperature > 38.5) {
            predictions.push({
                disease: 'Malaria',
                confidence: 0.72,
                icd10Code: 'B54'
            });
        }

        if (input.vitalSigns.bloodPressureSystolic && input.vitalSigns.bloodPressureSystolic > 140) {
            predictions.push({
                disease: 'Hypertension',
                confidence: 0.82,
                icd10Code: 'I10'
            });
        }

        if (symptomNames.some(s => s.includes('diarrhea') || s.includes('vomiting'))) {
            predictions.push({
                disease: 'Gastroenteritis',
                confidence: 0.78,
                icd10Code: 'A09'
            });
        }

        // If no specific predictions, add general ones
        if (predictions.length === 0) {
            predictions.push({
                disease: 'Common Cold',
                confidence: 0.65,
                icd10Code: 'J00'
            });
        }

        return predictions;
    }

    private getRecommendations(disease: string): string[] {
        const recommendationsMap: Record<string, string[]> = {
            'Common Cold': [
                'Rest and adequate sleep',
                'Increase fluid intake',
                'Over-the-counter pain relievers if needed',
                'Monitor symptoms for 7-10 days'
            ],
            'Influenza': [
                'Antiviral medication within 48 hours of symptom onset',
                'Complete bed rest',
                'Isolation to prevent spread',
                'Monitor for complications'
            ],
            'Malaria': [
                'Immediate antimalarial treatment',
                'Blood test confirmation recommended',
                'Monitor for severe symptoms',
                'Prevent mosquito bites'
            ],
            'Hypertension': [
                'Lifestyle modifications (diet, exercise)',
                'Regular blood pressure monitoring',
                'Consider antihypertensive medication',
                'Follow-up in 2-4 weeks'
            ],
            'Gastroenteritis': [
                'Oral rehydration therapy',
                'BRAT diet (Bananas, Rice, Applesauce, Toast)',
                'Avoid dairy and fatty foods',
                'Monitor for dehydration signs'
            ]
        };

        return recommendationsMap[disease] || [
            'Consult with healthcare provider',
            'Monitor symptoms closely',
            'Follow prescribed treatment plan',
            'Schedule follow-up visit'
        ];
    }
}
