import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import './swipe-cards.css';

type Card = {
  id: number;
  text: string;
};

type SwipeCardsProps = {
  cards: Card[];
};

const SwipeCards: React.FC<SwipeCardsProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = (card: Card) => {
    console.log('Swiped left on:', card);
    return null;
  };

  const handleSwipeRight = (card: Card) => {
    console.log('Swiped right on:', card);
    return null;
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < cards.length) {
        handleSwipeLeft(cards[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex < cards.length) {
        handleSwipeRight(cards[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    },
    trackMouse: true,
  });

  if (currentIndex >= cards.length) {
    return <div className="swipe-cards-end">No more cards</div>;
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="swipe-cards-container" {...swipeHandlers}>
      <div className="swipe-card">
        <p>{currentCard.text}</p>
      </div>
    </div>
  );
};

export default SwipeCards;
