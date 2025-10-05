interface MuscleCard {
  id: number;
  imageUrl: string;
  name: string;
  description: string;
}

// サンプルデータ（実際の画像URLに置き換えてください）
const muscleCards: MuscleCard[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=700&fit=crop',
    name: '筋肉タイプA',
    description: 'バランスの取れた体型'
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=700&fit=crop',
    name: '筋肉タイプB',
    description: '上半身重視の体型'
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500&h=700&fit=crop',
    name: '筋肉タイプC',
    description: '細マッチョ体型'
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=700&fit=crop',
    name: '筋肉タイプD',
    description: 'アスリート体型'
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=700&fit=crop',
    name: '筋肉タイプE',
    description: 'ボディビルダー体型'
  }
];

class CardSwiper {
  private cards: MuscleCard[];
  private currentIndex: number = 0;
  private likeCount: number = 0;
  private dislikeCount: number = 0;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private currentCard: HTMLElement | null = null;

  constructor(cards: MuscleCard[]) {
    this.cards = cards;
    this.init();
  }

  private init(): void {
    this.renderCards();
    this.attachEventListeners();
  }

  private renderCards(): void {
    const cardsStack = document.getElementById('cards-stack');
    if (!cardsStack) return;

    cardsStack.innerHTML = '';

    // 最大3枚のカードを表示（スタック効果のため）
    const cardsToShow = this.cards.slice(this.currentIndex, this.currentIndex + 3);

    cardsToShow.reverse().forEach((card, index) => {
      const cardElement = this.createCardElement(card, index);
      cardsStack.appendChild(cardElement);
    });

    this.currentCard = cardsStack.querySelector('.card:last-child');
    this.attachCardListeners();
  }

  private createCardElement(card: MuscleCard, stackIndex: number): HTMLElement {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.zIndex = `${10 - stackIndex}`;

    // スタック効果のためのスケールと位置調整
    const scale = 1 - (stackIndex * 0.05);
    const translateY = stackIndex * 10;
    cardDiv.style.transform = `scale(${scale}) translateY(${translateY}px)`;

    cardDiv.innerHTML = `
      <img src="${card.imageUrl}" alt="${card.name}">
      <div class="card-info">
        <h2>${card.name}</h2>
        <p>${card.description}</p>
      </div>
      <div class="card-badge like">LIKE</div>
      <div class="card-badge dislike">NOPE</div>
    `;

    return cardDiv;
  }

  private attachEventListeners(): void {
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const resetBtn = document.getElementById('reset-btn');

    likeBtn?.addEventListener('click', () => this.handleLike());
    dislikeBtn?.addEventListener('click', () => this.handleDislike());
    resetBtn?.addEventListener('click', () => this.reset());
  }

  private attachCardListeners(): void {
    if (!this.currentCard) return;

    this.currentCard.addEventListener('mousedown', this.onDragStart.bind(this));
    this.currentCard.addEventListener('touchstart', this.onDragStart.bind(this));

    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('touchmove', this.onDragMove.bind(this));

    document.addEventListener('mouseup', this.onDragEnd.bind(this));
    document.addEventListener('touchend', this.onDragEnd.bind(this));
  }

  private onDragStart(e: MouseEvent | TouchEvent): void {
    if (!this.currentCard) return;

    this.isDragging = true;
    this.currentCard.style.transition = 'none';

    if (e instanceof MouseEvent) {
      this.startX = e.clientX;
      this.startY = e.clientY;
    } else {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }
  }

  private onDragMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.currentCard) return;

    let clientX: number, clientY: number;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    this.currentX = clientX - this.startX;
    this.currentY = clientY - this.startY;

    const rotate = this.currentX * 0.1;
    this.currentCard.style.transform = `translate(${this.currentX}px, ${this.currentY}px) rotate(${rotate}deg)`;

    // バッジの表示
    const likeBadge = this.currentCard.querySelector('.card-badge.like') as HTMLElement;
    const dislikeBadge = this.currentCard.querySelector('.card-badge.dislike') as HTMLElement;

    if (this.currentX > 50) {
      likeBadge?.classList.add('visible');
      dislikeBadge?.classList.remove('visible');
    } else if (this.currentX < -50) {
      dislikeBadge?.classList.add('visible');
      likeBadge?.classList.remove('visible');
    } else {
      likeBadge?.classList.remove('visible');
      dislikeBadge?.classList.remove('visible');
    }
  }

  private onDragEnd(): void {
    if (!this.isDragging || !this.currentCard) return;

    this.isDragging = false;

    const threshold = 100;

    if (this.currentX > threshold) {
      this.swipeCard('right');
    } else if (this.currentX < -threshold) {
      this.swipeCard('left');
    } else {
      // カードを元の位置に戻す
      this.currentCard.style.transition = 'transform 0.3s ease';
      this.currentCard.style.transform = '';

      const likeBadge = this.currentCard.querySelector('.card-badge.like') as HTMLElement;
      const dislikeBadge = this.currentCard.querySelector('.card-badge.dislike') as HTMLElement;
      likeBadge?.classList.remove('visible');
      dislikeBadge?.classList.remove('visible');
    }

    this.currentX = 0;
    this.currentY = 0;
  }

  private swipeCard(direction: 'left' | 'right'): void {
    if (!this.currentCard) return;

    const flyX = direction === 'right' ? 1000 : -1000;

    this.currentCard.classList.add('animating');
    this.currentCard.style.transform = `translate(${flyX}px, ${this.currentY}px) rotate(${flyX * 0.1}deg)`;
    this.currentCard.style.opacity = '0';

    if (direction === 'right') {
      this.likeCount++;
      this.updateStats();
    } else {
      this.dislikeCount++;
      this.updateStats();
    }

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.cards.length) {
        this.showNoMoreCards();
      } else {
        this.renderCards();
      }
    }, 300);
  }

  private handleLike(): void {
    this.swipeCard('right');
  }

  private handleDislike(): void {
    this.swipeCard('left');
  }

  private updateStats(): void {
    const likeCountElement = document.getElementById('like-count');
    const dislikeCountElement = document.getElementById('dislike-count');

    if (likeCountElement) likeCountElement.textContent = this.likeCount.toString();
    if (dislikeCountElement) dislikeCountElement.textContent = this.dislikeCount.toString();
  }

  private showNoMoreCards(): void {
    const cardsStack = document.getElementById('cards-stack');
    const noMoreCards = document.querySelector('.no-more-cards') as HTMLElement;

    if (cardsStack) cardsStack.style.display = 'none';
    if (noMoreCards) noMoreCards.style.display = 'block';
  }

  private reset(): void {
    this.currentIndex = 0;
    this.likeCount = 0;
    this.dislikeCount = 0;

    const cardsStack = document.getElementById('cards-stack');
    const noMoreCards = document.querySelector('.no-more-cards') as HTMLElement;

    if (cardsStack) cardsStack.style.display = 'block';
    if (noMoreCards) noMoreCards.style.display = 'none';

    this.updateStats();
    this.renderCards();
  }
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', () => {
  new CardSwiper(muscleCards);
});
