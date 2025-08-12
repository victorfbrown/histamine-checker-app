import { neon } from '@neondatabase/serverless';
import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ingredients } from './utils/ingredients';
const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
const sql = neon(DB_URL);

// Fetch ingredients where edible column is null
const fetchUnclassifiedIngredients = async () => {
    try {
        const result = await sql`SELECT id, ingredient FROM histamine_checker WHERE edible IS NULL AND ingredient NOT NULL ORDER BY id LIMIT 300`;
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

async function classifyIngredient(event: KeyboardEvent, handleClassify: (accepted: boolean) => void) {
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
        console.log('escape/up arrow pressed - ', key)
    } else if (upKey) {
        console.log('up arrow pressed - ', key)
    }
}

function Classify() {

    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [classifiedCards, setClassifiedCards] = useState<Set<number>>(new Set())
    const [ingredientCards, setIngredientCards] = useState<Array<{ id: number, text: string, color: string }>>([])
    const [isLoading, setIsLoading] = useState(true)

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
        if (accepted) {
            console.log(`Accepted: ${currentCard.text}`);
            setClassifiedCards(prev => new Set([...prev, currentCard.id]));
            // Update database - Yes for edible
            await updateIngredientClassification(currentCard.text, true);
        } else {
            console.log(`Rejected: ${currentCard.text}`);
            // Update database - No for edible
            await updateIngredientClassification(currentCard.text, false);
        }

        // Move to next card
        if (currentCardIndex < ingredientCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    }, [currentCardIndex, ingredientCards]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => classifyIngredient(event, handleClassify);

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClassify]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', margin: '50px' }}>Loading ingredients...</div>;
    }

    if (ingredientCards.length === 0) {
        return <div style={{ textAlign: 'center', margin: '50px' }}>No ingredients to classify!</div>;
    }

    return (
        <>
            <h1>Classify Ingredients</h1>
            <p>Use a/← to reject or d/→ to accept the current ingredient</p>

            <div style={{
                position: 'relative',
                width: '600px',
                height: '200px',
                margin: '40px auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Render cards in reverse order so first cards appear on top */}
                {ingredientCards.slice(currentCardIndex, currentCardIndex + 3).reverse().map((card, stackIndex) => {
                    const isTopCard = stackIndex === 0;
                    const zIndex = 100 - stackIndex;
                    const offset = stackIndex * 4;
                    const scale = 1 - (stackIndex * 0.05);
                    const opacity = 1 - (stackIndex * 0.3);

                    return (
                        <div
                            key={card.id}
                            style={{
                                position: 'absolute',
                                width: '560px',
                                height: '180px',
                                backgroundColor: card.color,
                                borderRadius: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isTopCard ? 'pointer' : 'default',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: 'white',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                                transform: `translate(${offset}px, ${offset}px) scale(${scale})`,
                                opacity: opacity,
                                zIndex: zIndex,
                                transition: 'all 0.3s ease',
                                border: classifiedCards.has(card.id)
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
                                {card.text}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                textAlign: 'center',
                                opacity: 0.9,
                                padding: '0 20px'
                            }}>
                                Card {card.id + 1} of {ingredientCards.length}
                            </div>
                        </div>
                    );
                })}
            </div>

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
            </div>

        </>
    )
}

export default Classify
