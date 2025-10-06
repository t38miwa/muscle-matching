interface User {
  id: number;
  imageUrl: string;
  name: string;
  age: number;
  gym: string;
  purpose: string;
  gender: string;
  likes: number;
  bio?: string;
}

interface Match {
  user: User;
  matchedAt: Date;
  lastMessage?: string;
}

interface Message {
  text: string;
  sent: boolean;
  time: string;
}

interface Profile {
  name: string;
  age: number;
  gender: string;
  gym: string;
  purpose: string;
  bio: string;
  imageUrl: string;
}

// サンプルユーザーデータ
const users: User[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=700&fit=crop',
    name: '太郎',
    age: 28,
    gym: 'ゴールドジム 渋谷',
    purpose: '合トレ仲間を探したい',
    gender: 'male',
    likes: 245
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=700&fit=crop',
    name: '健二',
    age: 32,
    gym: 'エニタイムフィットネス 新宿',
    purpose: 'トレーニング仲間募集',
    gender: 'male',
    likes: 189
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=500&h=700&fit=crop',
    name: '翔太',
    age: 25,
    gym: 'コナミスポーツクラブ 池袋',
    purpose: 'マッチング',
    gender: 'male',
    likes: 312
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=700&fit=crop',
    name: '大輔',
    age: 30,
    gym: 'ゴールドジム 原宿',
    purpose: '合トレパートナー探し',
    gender: 'male',
    likes: 267
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&h=700&fit=crop',
    name: '隆',
    age: 35,
    gym: 'ティップネス 六本木',
    purpose: '筋トレ友達を作りたい',
    gender: 'male',
    likes: 198
  }
];

class MuscleMatchingApp {
  private users: User[];
  private currentIndex: number = 0;
  private likeCount: number = 0;
  private dislikeCount: number = 0;
  private matches: Match[] = [];
  private currentChatUser: User | null = null;
  private messages: Map<number, Message[]> = new Map();
  private myProfile: Profile | null = null;

  // スワイプ関連
  private isDragging: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private currentCard: HTMLElement | null = null;

  constructor(users: User[]) {
    this.users = users;
    this.init();
  }

  private init(): void {
    this.setupNavigation();
    this.renderCards();
    this.attachEventListeners();
    this.initializeMatches();
    this.loadProfile();
    this.setupProfileHandlers();
  }

  // ナビゲーション
  private setupNavigation(): void {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const screenName = target.dataset.screen;
        this.switchScreen(screenName || 'swipe');
      });
    });
  }

  private switchScreen(screenName: string): void {
    // ナビゲーションボタンのアクティブ状態を更新
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-screen') === screenName) {
        btn.classList.add('active');
      }
    });

    // 画面の表示切り替え
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }

    // 画面ごとの初期化処理
    if (screenName === 'messages') {
      this.renderMatches();
    } else if (screenName === 'ranking') {
      this.renderRanking('male');
    }
  }

  // カードスワイプ機能
  private renderCards(): void {
    const cardsStack = document.getElementById('cards-stack');
    if (!cardsStack) return;

    cardsStack.innerHTML = '';

    const cardsToShow = this.users.slice(this.currentIndex, this.currentIndex + 3);

    cardsToShow.reverse().forEach((user, index) => {
      const cardElement = this.createCardElement(user, index);
      cardsStack.appendChild(cardElement);
    });

    this.currentCard = cardsStack.querySelector('.card:last-child');
    this.attachCardListeners();
  }

  private createCardElement(user: User, stackIndex: number): HTMLElement {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.zIndex = `${10 - stackIndex}`;

    const scale = 1 - (stackIndex * 0.05);
    const translateY = stackIndex * 10;
    cardDiv.style.transform = `scale(${scale}) translateY(${translateY}px)`;

    cardDiv.innerHTML = `
      <img src="${user.imageUrl}" alt="${user.name}">
      <div class="card-info">
        <h2>${user.name}, ${user.age}</h2>
        <div class="card-info-details">
          <div class="card-info-item">
            <span class="icon">🏋️</span>
            <span>${user.gym}</span>
          </div>
          <div class="card-info-item">
            <span class="icon">🎯</span>
            <span class="card-purpose">${user.purpose}</span>
          </div>
        </div>
      </div>
      <div class="card-badge like">LIKE</div>
      <div class="card-badge dislike">NOPE</div>
    `;

    return cardDiv;
  }

  private attachEventListeners(): void {
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');

    likeBtn?.addEventListener('click', () => this.handleLike());
    dislikeBtn?.addEventListener('click', () => this.handleDislike());
    undoBtn?.addEventListener('click', () => this.handleUndo());
    resetBtn?.addEventListener('click', () => this.reset());

    // モーダル関連
    document.getElementById('keep-swiping')?.addEventListener('click', () => {
      this.hideMatchModal();
    });

    document.getElementById('send-message')?.addEventListener('click', () => {
      this.hideMatchModal();
      this.switchScreen('messages');
    });
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

      // ランダムでマッチング
      if (Math.random() > 0.5) {
        const currentUser = this.users[this.currentIndex];
        this.addMatch(currentUser);
        setTimeout(() => this.showMatchModal(currentUser), 400);
      }
    } else {
      this.dislikeCount++;
      this.updateStats();
    }

    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.users.length) {
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

  private handleUndo(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      if (this.likeCount > 0) this.likeCount--;
      else if (this.dislikeCount > 0) this.dislikeCount--;
      this.updateStats();
      this.renderCards();

      const noMoreCards = document.querySelector('.no-more-cards') as HTMLElement;
      const cardsStack = document.getElementById('cards-stack');
      if (noMoreCards && cardsStack) {
        noMoreCards.style.display = 'none';
        cardsStack.style.display = 'block';
      }
    }
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

  // マッチング機能
  private addMatch(user: User): void {
    const match: Match = {
      user: user,
      matchedAt: new Date()
    };
    this.matches.push(match);

    // サンプルメッセージを追加
    this.messages.set(user.id, [
      {
        text: 'マッチしました！よろしくお願いします！',
        sent: false,
        time: '今'
      }
    ]);
  }

  private showMatchModal(user: User): void {
    const modal = document.getElementById('match-modal');
    const matchAvatar = document.getElementById('match-avatar') as HTMLImageElement;
    const matchName = document.getElementById('match-name');

    if (modal && matchAvatar && matchName) {
      matchAvatar.src = user.imageUrl;
      matchName.textContent = `${user.name}さんとマッチしました！`;
      modal.classList.add('show');
    }
  }

  private hideMatchModal(): void {
    const modal = document.getElementById('match-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  // メッセージ機能
  private initializeMatches(): void {
    // 初期マッチを設定
    const initialMatches = [users[0], users[2]];
    initialMatches.forEach(user => {
      this.addMatch(user);
    });
  }

  private renderMatches(): void {
    const matchesList = document.getElementById('matches-list');
    if (!matchesList) return;

    matchesList.innerHTML = '';

    if (this.matches.length === 0) {
      matchesList.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">まだマッチがありません</p>';
      return;
    }

    this.matches.forEach(match => {
      const matchItem = document.createElement('div');
      matchItem.className = 'match-item';
      matchItem.innerHTML = `
        <img class="match-avatar" src="${match.user.imageUrl}" alt="${match.user.name}">
        <div class="match-info">
          <h3>${match.user.name}</h3>
          <p>${match.lastMessage || 'マッチしました！'}</p>
        </div>
        <span class="match-time">今</span>
      `;

      matchItem.addEventListener('click', () => this.openChat(match.user));
      matchesList.appendChild(matchItem);
    });
  }

  private openChat(user: User): void {
    this.currentChatUser = user;
    const matchesList = document.getElementById('matches-list');
    const chatContainer = document.getElementById('chat-container');

    if (matchesList && chatContainer) {
      matchesList.style.display = 'none';
      chatContainer.style.display = 'flex';
    }

    // チャットヘッダーを更新
    const chatAvatar = document.getElementById('chat-avatar') as HTMLImageElement;
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserGym = document.getElementById('chat-user-gym');

    if (chatAvatar && chatUserName && chatUserGym) {
      chatAvatar.src = user.imageUrl;
      chatUserName.textContent = user.name;
      chatUserGym.textContent = user.gym;
    }

    this.renderMessages(user.id);
    this.setupChatInput();

    // 戻るボタン
    const backBtn = document.getElementById('back-to-matches');
    backBtn?.addEventListener('click', () => {
      if (matchesList && chatContainer) {
        matchesList.style.display = 'block';
        chatContainer.style.display = 'none';
      }
    });
  }

  private renderMessages(userId: number): void {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messages = this.messages.get(userId) || [];
    chatMessages.innerHTML = '';

    messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${msg.sent ? 'sent' : ''}`;
      messageDiv.innerHTML = `
        <div class="message-bubble">${msg.text}</div>
        <span class="message-time">${msg.time}</span>
      `;
      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  private setupChatInput(): void {
    const chatInput = document.getElementById('chat-input') as HTMLInputElement;
    const sendBtn = document.getElementById('send-btn');

    const sendMessage = () => {
      if (!chatInput || !this.currentChatUser) return;

      const text = chatInput.value.trim();
      if (text === '') return;

      const messages = this.messages.get(this.currentChatUser.id) || [];
      messages.push({
        text: text,
        sent: true,
        time: '今'
      });
      this.messages.set(this.currentChatUser.id, messages);

      chatInput.value = '';
      this.renderMessages(this.currentChatUser.id);
    };

    sendBtn?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // ランキング機能
  private renderRanking(gender: string): void {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;

    // 性別でフィルタリングしてLikes順にソート
    const filteredUsers = this.users
      .filter(user => user.gender === gender)
      .sort((a, b) => b.likes - a.likes);

    rankingList.innerHTML = '';

    filteredUsers.forEach((user, index) => {
      const rankingItem = document.createElement('div');
      rankingItem.className = 'ranking-item';

      let rankClass = '';
      if (index === 0) rankClass = 'gold';
      else if (index === 1) rankClass = 'silver';
      else if (index === 2) rankClass = 'bronze';

      rankingItem.innerHTML = `
        <div class="ranking-number ${rankClass}">${index + 1}</div>
        <img class="ranking-avatar" src="${user.imageUrl}" alt="${user.name}">
        <div class="ranking-info">
          <h3>${user.name}, ${user.age}</h3>
          <p>${user.gym}</p>
        </div>
        <div class="ranking-likes">
          <span>👍</span>
          <span>${user.likes}</span>
        </div>
      `;

      rankingList.appendChild(rankingItem);
    });

    // タブの切り替え
    const rankingTabs = document.querySelectorAll('.ranking-tab');
    rankingTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const selectedGender = target.dataset.gender;

        rankingTabs.forEach(t => t.classList.remove('active'));
        target.classList.add('active');

        if (selectedGender) {
          this.renderRanking(selectedGender);
        }
      });
    });
  }

  // プロフィール機能
  private setupProfileHandlers(): void {
    const profileForm = document.getElementById('profile-form') as HTMLFormElement;
    const photoUploadBtn = document.getElementById('photo-upload-btn');
    const photoInput = document.getElementById('photo-input') as HTMLInputElement;
    const previewImg = document.getElementById('profile-preview-img') as HTMLImageElement;
    const viewProfileBtn = document.getElementById('view-my-profile');
    const logoutBtn = document.getElementById('logout-btn');

    // 写真アップロードボタン
    photoUploadBtn?.addEventListener('click', () => {
      photoInput.click();
    });

    // 写真選択時のプレビュー
    photoInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && previewImg) {
            previewImg.src = e.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // フォーム送信
    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    // プロフィールプレビュー
    viewProfileBtn?.addEventListener('click', () => {
      this.showProfilePreview();
    });

    // ログアウト
    logoutBtn?.addEventListener('click', () => {
      if (confirm('ログアウトしますか？')) {
        localStorage.removeItem('muscleMatchingProfile');
        this.myProfile = null;
        alert('ログアウトしました');
        this.clearProfileForm();
      }
    });
  }

  private loadProfile(): void {
    const savedProfile = localStorage.getItem('muscleMatchingProfile');
    if (savedProfile) {
      this.myProfile = JSON.parse(savedProfile);
      this.fillProfileForm();
    }
  }

  private fillProfileForm(): void {
    if (!this.myProfile) return;

    const nameInput = document.getElementById('profile-name') as HTMLInputElement;
    const ageInput = document.getElementById('profile-age') as HTMLInputElement;
    const genderSelect = document.getElementById('profile-gender') as HTMLSelectElement;
    const gymInput = document.getElementById('profile-gym') as HTMLInputElement;
    const purposeSelect = document.getElementById('profile-purpose') as HTMLSelectElement;
    const bioTextarea = document.getElementById('profile-bio') as HTMLTextAreaElement;
    const previewImg = document.getElementById('profile-preview-img') as HTMLImageElement;

    if (nameInput) nameInput.value = this.myProfile.name;
    if (ageInput) ageInput.value = this.myProfile.age.toString();
    if (genderSelect) genderSelect.value = this.myProfile.gender;
    if (gymInput) gymInput.value = this.myProfile.gym;
    if (purposeSelect) purposeSelect.value = this.myProfile.purpose;
    if (bioTextarea) bioTextarea.value = this.myProfile.bio;
    if (previewImg && this.myProfile.imageUrl) previewImg.src = this.myProfile.imageUrl;
  }

  private clearProfileForm(): void {
    const profileForm = document.getElementById('profile-form') as HTMLFormElement;
    if (profileForm) {
      profileForm.reset();
    }
    const previewImg = document.getElementById('profile-preview-img') as HTMLImageElement;
    if (previewImg) {
      previewImg.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop';
    }
  }

  private saveProfile(): void {
    const nameInput = document.getElementById('profile-name') as HTMLInputElement;
    const ageInput = document.getElementById('profile-age') as HTMLInputElement;
    const genderSelect = document.getElementById('profile-gender') as HTMLSelectElement;
    const gymInput = document.getElementById('profile-gym') as HTMLInputElement;
    const purposeSelect = document.getElementById('profile-purpose') as HTMLSelectElement;
    const bioTextarea = document.getElementById('profile-bio') as HTMLTextAreaElement;
    const previewImg = document.getElementById('profile-preview-img') as HTMLImageElement;

    const profile: Profile = {
      name: nameInput.value,
      age: parseInt(ageInput.value),
      gender: genderSelect.value,
      gym: gymInput.value,
      purpose: purposeSelect.value,
      bio: bioTextarea.value,
      imageUrl: previewImg.src
    };

    this.myProfile = profile;
    localStorage.setItem('muscleMatchingProfile', JSON.stringify(profile));

    alert('プロフィールを保存しました！');
  }

  private showProfilePreview(): void {
    if (!this.myProfile) {
      alert('プロフィールを先に保存してください');
      return;
    }

    const previewHtml = `
      <div style="max-width: 400px; margin: 20px auto; padding: 20px; background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <img src="${this.myProfile.imageUrl}" style="width: 100%; height: 400px; object-fit: cover; border-radius: 15px; margin-bottom: 15px;">
        <h2 style="font-size: 1.8rem; margin-bottom: 8px;">${this.myProfile.name}, ${this.myProfile.age}</h2>
        <div style="margin: 10px 0;">
          <span style="font-size: 1.1rem;">🏋️ ${this.myProfile.gym}</span>
        </div>
        <div style="margin: 10px 0;">
          <span style="background: rgba(102, 126, 234, 0.8); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">🎯 ${this.myProfile.purpose}</span>
        </div>
        ${this.myProfile.bio ? `<p style="margin-top: 15px; color: #666; line-height: 1.6;">${this.myProfile.bio}</p>` : ''}
      </div>
    `;

    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="position: relative; max-width: 500px; width: 100%;">
        <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.5rem; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">✕</button>
        ${previewHtml}
      </div>
    `;

    document.body.appendChild(modal);
  }
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', () => {
  new MuscleMatchingApp(users);
});
