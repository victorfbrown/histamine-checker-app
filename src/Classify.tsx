import { neon } from '@neondatabase/serverless';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { ingredients } from './utils/ingredients';
const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
const sql = neon(DB_URL);

// Fetch ingredients where edible column is null
const fetchUnclassifiedIngredients = async () => {
    try {
        const result = await sql`SELECT id, ingredient FROM histamine_checker WHERE edible IS NULL AND ingredient IS NOT NULL ORDER BY id LIMIT 300`;
        return result;
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return [];
    }
};

// Update ingredient classification in database
const updateIngredientClassification = async (ingredientName: string, isEdible: boolean) => {
    try {
        const edibleValue = isEdible ? 'Yes' : 'No';
        await sql`UPDATE histamine_checker SET edible = ${edibleValue} WHERE ingredient = ${ingredientName}`;
        console.log(`Updated ingredient "${ingredientName}" to edible: ${edibleValue}`);
    } catch (error) {
        console.error('Error updating ingredient:', error);
    }
};

// Update ingredient with notes and "Depends" classification
const updateIngredientWithNotes = async (ingredientName: string, notes: string) => {
    try {
        await sql`UPDATE histamine_checker SET edible = 'Depends', notes = ${notes} WHERE ingredient = ${ingredientName}`;
        console.log(`Updated ingredient "${ingredientName}" to edible: Depends with notes: ${notes}`);
    } catch (error) {
        console.error('Error updating ingredient with notes:', error);
    }
};

async function classifyIngredient(event: KeyboardEvent, handleClassify: (accepted: boolean) => void, handleSkip: () => void, handleAddNotes: () => void) {
    const key = event.key.toLowerCase()
    const rejectIngredient = ["arrowleft", "a"].includes(key)
    const acceptIngredient = ["arrowright", "d"].includes(key)
    const escapeKey = ["escape"].includes(key)
    const upKey = ["arrowup"].includes(key)

    if (rejectIngredient) {
        console.log('rejecting - ', key)
        handleClassify(false)
    } else if (acceptIngredient) {
        console.log('accepting - ', key)
        handleClassify(true)
    } else if (escapeKey) {
        console.log('escape pressed - skipping card')
        handleSkip()
    } else if (upKey) {
        console.log('up arrow pressed - adding notes')
        handleAddNotes()
    }
}

function Classify() {

    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [classifiedCards, setClassifiedCards] = useState<Set<number>>(new Set())
    const [ingredientCards, setIngredientCards] = useState<Array<{ id: number, text: string, color: string }>>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showNotesInput, setShowNotesInput] = useState(false)
    const [notesText, setNotesText] = useState('')
    const navigate = useNavigate();

    // Fetch unclassified ingredients on component mount
    useEffect(() => {
        const loadIngredients = async () => {
            setIsLoading(true);
            const dbIngredients = await fetchUnclassifiedIngredients();

            if (dbIngredients.length > 0) {
                // Use database ingredients
                const cards = dbIngredients.map((item: Record<string, any>) => ({
                    id: item.id as number,
                    text: item.ingredient as string,
                    color: '#8B5CF6'
                }));
                setIngredientCards(cards);
            } else {
                // Fallback to local ingredients if database is empty
                const fallbackCards = ingredients.slice(0, 300).map((ingredient, index) => ({
                    id: index,
                    text: ingredient,
                    color: '#8B5CF6'
                }));
                setIngredientCards(fallbackCards);
            }
            setIsLoading(false);
        };

        loadIngredients();
    }, []);

    const handleClassify = useCallback(async (accepted: boolean) => {
        if (ingredientCards.length === 0) return;

        const currentCard = ingredientCards[currentCardIndex];
        if (!currentCard) return;

        // Use the actual database record data
        if (accepted) {
            console.log(`Accepted: ${currentCard.text}`);
            setClassifiedCards(prev => new Set([...prev, currentCard.id]));
            // Update database using the actual ingredient name from the card
            await updateIngredientClassification(currentCard.text, true);
        } else {
            console.log(`Rejected: ${currentCard.text}`);
            // Update database using the actual ingredient name from the card
            await updateIngredientClassification(currentCard.text, false);
        }

        // Move to next card
        if (currentCardIndex < ingredientCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    }, [currentCardIndex, ingredientCards]);

    const handleSkip = useCallback(() => {
        // Skip current card and move to next
        if (currentCardIndex < ingredientCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    }, [currentCardIndex, ingredientCards.length]);

    const handleAddNotes = useCallback(() => {
        setShowNotesInput(true);
    }, []);

    const handleSubmitNotes = async () => {
        if (ingredientCards.length === 0 || notesText.trim() === '') return;

        const currentCard = ingredientCards[currentCardIndex];
        if (!currentCard) return;

        // Use the actual ingredient name from the card
        await updateIngredientWithNotes(currentCard.text, notesText.trim());

        // Move to next card
        if (currentCardIndex < ingredientCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }

        // Reset notes input
        setNotesText('');
        setShowNotesInput(false);
    };

    const handleCancelNotes = () => {
        setNotesText('');
        setShowNotesInput(false);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => classifyIngredient(event, handleClassify, handleSkip, handleAddNotes);

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClassify, handleSkip, handleAddNotes]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', margin: '50px' }}>Loading ingredients...</div>;
    }

    if (ingredientCards.length === 0) {
        return <div style={{ textAlign: 'center', margin: '50px' }}>No ingredients to classify!</div>;
    }

    return (
        <>
            <h1>Classify Ingredients</h1>
            <p>Use A/← to reject, D/→ to accept, ESC to skip, ↑ to add notes</p>

            <div style={{
                width: '600px',
                margin: '40px auto',
                textAlign: 'center'
            }}>
                {/* Display current card in simple format */}
                {ingredientCards[currentCardIndex] && (
                    <div
                        style={{
                            width: '560px',
                            height: '180px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                            border: classifiedCards.has(ingredientCards[currentCardIndex].id)
                                ? '4px solid #10B981'
                                : 'none',
                            userSelect: 'none',
                            padding: '20px',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{
                            fontSize: '24px',
                            marginBottom: '15px',
                            lineHeight: '1.2',
                            maxWidth: '520px',
                            wordWrap: 'break-word'
                        }}>
                            {ingredientCards[currentCardIndex].text}
                        </div>
                        <div style={{
                            fontSize: '14px',
                            textAlign: 'center',
                            opacity: 0.9,
                            padding: '0 20px'
                        }}>
                            Card {currentCardIndex + 1} of {ingredientCards.length}
                        </div>
                    </div>
                )}
            </div>

            {/* Notes Input Modal */}
            {showNotesInput && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
                            Add Notes for: {ingredientCards[currentCardIndex]?.text}
                        </h3>
                        <p style={{ marginBottom: '20px', color: '#666' }}>
                            This ingredient will be marked as "Depends" with your notes.
                        </p>
                        <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Enter your notes here..."
                            autoFocus
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '15px',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'flex-end',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={handleCancelNotes}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6B7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitNotes}
                                disabled={notesText.trim() === ''}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: notesText.trim() === '' ? '#9CA3AF' : '#8B5CF6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: notesText.trim() === '' ? 'not-allowed' : 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Submit Notes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button
                    onClick={() => handleClassify(true)}
                    style={{
                        marginRight: '15px',
                        padding: '12px 24px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Accept
                </button>
                <button
                    onClick={() => handleClassify(false)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Reject
                </button>
                <button
                    onClick={handleSkip}
                    style={{
                        marginLeft: '15px',
                        padding: '12px 24px',
                        backgroundColor: '#6B7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    }}
                >
                    Skip
                </button>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button
                    onClick={() => navigate('/classified')}
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
                    View Classified Ingredients
                </button>
            </div>

        </>
    )
}

export default Classify
