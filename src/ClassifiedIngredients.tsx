import { neon } from '@neondatabase/serverless';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL;
const sql = neon(DB_URL);

interface ClassifiedIngredient {
    ingredient: string;
    edible: string;
}

function ClassifiedIngredients() {
    const [ingredients, setIngredients] = useState<ClassifiedIngredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
    const navigate = useNavigate();

    const fetchClassifiedIngredients = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query;
            if (filter === 'yes') {
                query = sql`SELECT ingredient, edible FROM histamine_checker WHERE edible IS NOT NULL AND edible = 'Yes' AND ingredient IS NOT NULL ORDER BY ingredient`;
            } else if (filter === 'no') {
                query = sql`SELECT ingredient, edible FROM histamine_checker WHERE edible IS NOT NULL AND edible = 'No' AND ingredient IS NOT NULL ORDER BY ingredient`;
            } else {
                query = sql`SELECT ingredient, edible FROM histamine_checker WHERE edible IS NOT NULL AND ingredient IS NOT NULL ORDER BY ingredient`;
            }

            const result = await query;
            // Map the database result to match our interface
            const typedIngredients = result.map((item: Record<string, any>) => ({
                ingredient: item.ingredient as string,
                edible: item.edible as string
            }));
            setIngredients(typedIngredients);
        } catch (err) {
            console.error('Error fetching classified ingredients:', err);
            setError('Failed to load ingredients from database');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClassifiedIngredients();
    }, [filter]);

    const getStats = () => {
        const yesCount = ingredients.filter(item => item.edible === 'Yes').length;
        const noCount = ingredients.filter(item => item.edible === 'No').length;
        return { yesCount, noCount, total: ingredients.length };
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', margin: '50px' }}>
                <h2>Loading classified ingredients...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', margin: '50px', color: 'red' }}>
                <h2>Error: {error}</h2>
                <button
                    onClick={fetchClassifiedIngredients}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>Classified Ingredients</h1>
                <button
                    onClick={() => navigate('/classify')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Back to Classify
                </button>
            </div>
            <p>View all ingredients that have been classified as edible or inedible</p>

            {/* Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h3>Edible (Yes)</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.yesCount}</p>
                </div>
                <div style={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h3>Inedible (No)</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.noCount}</p>
                </div>
                <div style={{
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    <h3>Total Classified</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</p>
                </div>
            </div>

            {/* Filter Controls */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ marginRight: '10px' }}>Filter by:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'yes' | 'no')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                >
                    <option value="all">All Classified</option>
                    <option value="yes">Edible (Yes)</option>
                    <option value="no">Inedible (No)</option>
                </select>
            </div>

            {/* Ingredients Table */}
            <div style={{
                backgroundColor: '#374151',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#4B5563' }}>
                            <th style={{
                                padding: '15px',
                                textAlign: 'left',
                                borderBottom: '1px solid #6B5563',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                Ingredient
                            </th>
                            <th style={{
                                padding: '15px',
                                textAlign: 'left',
                                borderBottom: '1px solid #6B5563',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                Classification
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #4B5563' }}>
                                <td style={{ padding: '15px', fontWeight: '500', color: 'white' }}>{item.ingredient}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: item.edible === 'Yes' ? '#D1FAE5' : '#FEE2E2',
                                        color: item.edible === 'Yes' ? '#065F46' : '#991B1B'
                                    }}>
                                        {item.edible}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {ingredients.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#6B7280',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '10px',
                    marginTop: '20px'
                }}>
                    <h3>No ingredients found</h3>
                    <p>No ingredients match the current filter criteria.</p>
                </div>
            )}
        </div>
    );
}

export default ClassifiedIngredients;
