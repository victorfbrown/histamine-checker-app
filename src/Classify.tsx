import { useEffect, useState } from 'react';
import './App.css';
// import { neon } from '@neondatabase/serverless';
// const DB_URL: string = import.meta.env.VITE_NETLIFY_DATABASE_URL
// const DB_NAME: string = 'histamine_checker'
// const sql = neon(DB_URL);
import { ingredients } from './utils/ingredients';
const first300 = ingredients.slice(0, 300)
// console.log(first300)

// Create cards from first 300 ingredients
const ingredientCards = first300.map((ingredient, index) => ({
    id: index,
    text: ingredient,
    color: '#8B5CF6' // Purple color
}));

async function classifyIngredient(event: KeyboardEvent, handleClassify: (accepted: boolean) => void) {
    const key = event.key.toLowerCase()
    const rejectIngredient = ["arrowleft", "a"].includes(key)
    const acceptIngredient = ["arrowright", "d"].includes(key)
    if (rejectIngredient) {
        console.log('rejecting - ', key)
        handleClassify(false)
    } else if (acceptIngredient) {
        console.log('accepting - ', key)
        handleClassify(true)
        // const [maxNumber] = await sql`SELECT max(id) from histamine_checker`
        // console.log(maxNumber)
    }
}

function Classify() {

    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [classifiedCards, setClassifiedCards] = useState<Set<number>>(new Set())

    const handleClassify = (accepted: boolean) => {
        const currentCard = ingredientCards[currentCardIndex];
        if (accepted) {
            console.log(`Accepted: ${currentCard.text}`);
            setClassifiedCards(prev => new Set([...prev, currentCard.id]));
        } else {
            console.log(`Rejected: ${currentCard.text}`);
        }

        // Move to next card
        if (currentCardIndex < ingredientCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => classifyIngredient(event, handleClassify);

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClassify]);

    // useEffect(() => {
    //     for (let i = 0; i < first300.length; i++) {
    //         const [testIngredients] = await sql.query(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
    //         console.log(`INSERT INTO ${DB_NAME} (ingredient) VALUES ${first300[i]};`)
    //     }
    // }, [])

    return (
        <>
            <h1>Classify Ingredients</h1>
            <p>Use A/← to reject or D/→ to accept the current ingredient</p>

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
