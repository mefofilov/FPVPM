document.addEventListener('DOMContentLoaded', () => {
  let isAuthenticated = localStorage.getItem('fastpvp_authenticated') === 'true';
  
  let user = {
    id: localStorage.getItem('fastpvp_userid') || ('user-' + Math.random().toString(36).substr(2, 9)),
    balance: Number(localStorage.getItem('fastpvp_balance')) || 1000,
    inRoomId: null,
    steamUsername: localStorage.getItem('fastpvp_steamname') || '',
    steamAvatar: localStorage.getItem('fastpvp_steamavatar') || '',
    stats: JSON.parse(localStorage.getItem('fastpvp_stats')) || {
      totalGames: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      headshots: 0,
      shotsHit: 0,
      shotsFired: 0,
      earnings: 0
    },
    matchHistory: JSON.parse(localStorage.getItem('fastpvp_history')) || []
  };
  
  let filters = {
    game: '',
    minBet: 0,
    maxBet: Infinity
  };
  
  updateAuthUI();
  
  function loadRooms() {
    return JSON.parse(localStorage.getItem('fastpvp_rooms') || '[]');
  }
  function saveRooms(rooms) {
    localStorage.setItem('fastpvp_rooms', JSON.stringify(rooms));
  }
  function updateBalance() {
    localStorage.setItem('fastpvp_balance', user.balance);
    
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
      const walletIcon = balanceElement.querySelector('.wallet-icon');
      balanceElement.innerHTML = '';
      if (walletIcon) {
        balanceElement.appendChild(walletIcon);
      } else {
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "wallet-icon");
        icon.setAttribute("width", "20");
        icon.setAttribute("height", "20");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "currentColor");
        icon.setAttribute("stroke-width", "2");
        icon.setAttribute("stroke-linecap", "round");
        icon.setAttribute("stroke-linejoin", "round");
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "1");
        rect.setAttribute("y", "4");
        rect.setAttribute("width", "22");
        rect.setAttribute("height", "16");
        rect.setAttribute("rx", "2");
        rect.setAttribute("ry", "2");
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "1");
        line.setAttribute("y1", "10");
        line.setAttribute("x2", "23");
        line.setAttribute("y2", "10");
        
        icon.appendChild(rect);
        icon.appendChild(line);
        balanceElement.appendChild(icon);
      }
      
      balanceElement.appendChild(document.createTextNode(` $${user.balance}`));
    }
    
    const profileBalanceElement = document.getElementById('profile-balance');
    if (profileBalanceElement) {
      const walletIcon = profileBalanceElement.querySelector('.wallet-icon');
      profileBalanceElement.innerHTML = '';
      if (walletIcon) {
        profileBalanceElement.appendChild(walletIcon);
      } else {
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "wallet-icon");
        icon.setAttribute("width", "16");
        icon.setAttribute("height", "16");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "currentColor");
        icon.setAttribute("stroke-width", "2");
        icon.setAttribute("stroke-linecap", "round");
        icon.setAttribute("stroke-linejoin", "round");
        
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "1");
        rect.setAttribute("y", "4");
        rect.setAttribute("width", "22");
        rect.setAttribute("height", "16");
        rect.setAttribute("rx", "2");
        rect.setAttribute("ry", "2");
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "1");
        line.setAttribute("y1", "10");
        line.setAttribute("x2", "23");
        line.setAttribute("y2", "10");
        
        icon.appendChild(rect);
        icon.appendChild(line);
        profileBalanceElement.appendChild(icon);
      }
      
      profileBalanceElement.appendChild(document.createTextNode(` $${user.balance}`));
    }
  }
  
  function saveUserStats() {
    localStorage.setItem('fastpvp_stats', JSON.stringify(user.stats));
    localStorage.setItem('fastpvp_history', JSON.stringify(user.matchHistory));
  }

  const roomsList = document.querySelector('.rooms__list');
  const createRoomBtn = document.querySelector('.controls__button--primary');
  const searchInput = document.querySelector('.controls__search');
  const filterBtn = document.querySelector('.controls__button--filter');
  const steamLoginBtn = document.getElementById('steam-login');
  const steamLoginMainBtn = document.getElementById('steam-login-main');
  const depositBtn = document.getElementById('deposit-btn');
  const withdrawBtn = document.getElementById('withdraw-btn');
  const profileLink = document.querySelector('.header__nav a:nth-child(2)');
  const logoutBtn = document.getElementById('logout-btn');
  
  const createRoomModal = document.getElementById('create-room-modal');
  const depositModal = document.getElementById('deposit-modal');
  const withdrawModal = document.getElementById('withdraw-modal');
  const profileModal = document.getElementById('profile-modal');
  const filterModal = document.getElementById('filter-modal');
  const modalCloseButtons = document.querySelectorAll('.modal__close');
  const modalCancelButtons = document.querySelectorAll('.modal__cancel');
  
  const modalCreate = document.querySelector('#create-room-modal .modal__create');
  const modalSelect = document.querySelector('#create-room-modal .modal__select');
  const modalInput = document.querySelector('#create-room-modal .modal__input');
  
  const filterGame = document.getElementById('filter-game');
  const filterMinBet = document.getElementById('filter-min-bet');
  const filterMaxBet = document.getElementById('filter-max-bet');
  const filterApply = document.getElementById('filter-apply');
  const filterReset = document.getElementById('filter-reset');
  
  const depositConfirmBtn = document.getElementById('deposit-confirm');
  const withdrawConfirmBtn = document.getElementById('withdraw-confirm');
  const profileDepositBtn = document.getElementById('profile-deposit-btn');
  const profileWithdrawBtn = document.getElementById('profile-withdraw-btn');
  
  let timerIntervals = {};

  const gameIcons = {
    'CS2': '🔫'
  };
  
  const cybershokeDuelServers = [
    { name: "Duel #1", ip: "46.174.55.132:28017" },
    { name: "Duel #2", ip: "45.92.38.55:28023" },
    { name: "Duel #3", ip: "162.55.2.53:27050" }
  ];
  
  function updateAuthUI() {
    localStorage.setItem('fastpvp_authenticated', isAuthenticated);
    localStorage.setItem('fastpvp_userid', user.id);
    localStorage.setItem('fastpvp_balance', user.balance);
    
    if (isAuthenticated) {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('user-section').style.display = 'flex';
      document.getElementById('auth-message').style.display = 'none';
      document.getElementById('main-content').style.display = 'block';
      updateBalance();
    } else {
      document.getElementById('auth-section').style.display = 'block';
      document.getElementById('user-section').style.display = 'none';
      document.getElementById('auth-message').style.display = 'block';
      document.getElementById('main-content').style.display = 'none';
    }
  }
  
  function authenticateWithSteam() {
    isAuthenticated = true;
    user.steamUsername = "SteamUser_" + Math.floor(Math.random() * 1000);
    user.steamAvatar = "https://avatars.cloudflare.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
    
    localStorage.setItem('fastpvp_authenticated', 'true');
    localStorage.setItem('fastpvp_steamname', user.steamUsername);
    localStorage.setItem('fastpvp_steamavatar', user.steamAvatar);
    
    updateAuthUI();
    renderRooms();
    
    alert("Successfully authenticated with Steam! Welcome, " + user.steamUsername);
  }

  function renderRooms() {
    if (!isAuthenticated) return;
    
    let rooms = loadRooms();
    rooms = rooms.filter(room => room.players.length > 0);
    saveRooms(rooms);

    roomsList.innerHTML = '';
    const searchFilter = searchInput.value.toLowerCase();
    
    rooms
      .filter(room => {
        const matchesSearch = room.game.toLowerCase().includes(searchFilter);
        
        const matchesGame = !filters.game || room.game === filters.game;
        
        const matchesBetRange = room.stake >= filters.minBet && 
                               (filters.maxBet === Infinity || room.stake <= filters.maxBet);
        
        return matchesSearch && matchesGame && matchesBetRange;
      })
      .forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        let statusHtml = '';
        if (room.status === 'pending') {
          statusHtml = `<span class="room-card__status room-card__status--pending">Pending</span>`;
        } else if (room.status === 'inplay') {
          statusHtml = `<span class="room-card__status room-card__status--inplay">In Play</span>`;
        } else if (room.status === 'ingame') {
          statusHtml = `<span class="room-card__status room-card__status--inplay">In Game</span>`;
        }

        let timerHtml = '';
        if (room.status === 'inplay') {
          const min = Math.floor(room.timer / 60);
          const sec = (room.timer % 60).toString().padStart(2, '0');
          timerHtml = `<span class="room-card__timer">⏱ ${min}:${sec}</span>`;
        }

        let actionHtml = '';
        const isUserHere = room.players.includes(user.id);

        if (room.status === 'pending') {
          if (!user.inRoomId) {
            actionHtml = `<button class="room-card__action room-card__action--join">🏆 Join</button>`;
          } else if (isUserHere) {
            actionHtml = `<button class="room-card__action room-card__action--quit">⛔ Quit</button>`;
          } else {
            actionHtml = `<button class="room-card__action" disabled>In another room</button>`;
          }
        } else if (room.status === 'inplay' && isUserHere) {
          const isReady = room.ready && room.ready.includes(user.id);
          if (!isReady) {
            actionHtml = `
              <button class="room-card__action room-card__action--quit">⛔ Quit</button>
              <button class="room-card__action room-card__action--ready">🏆 Ready</button>
            `;
          } else {
            actionHtml = `
              <button class="room-card__action room-card__action--server">🚀 Join Server</button>`;
          }
        } else if (room.status === 'inplay' && !isUserHere) {
          actionHtml = `<button class="room-card__action" disabled>Room is full</button>`;
        } else if (room.status === 'ingame' && isUserHere) {
          actionHtml = `<span style="color:#10b981;font-weight:700;text-align:center;display:block;">In Game</span>`;
        } else if (room.status === 'ingame' && !isUserHere) {
          actionHtml = `<button class="room-card__action" disabled>Room is in game</button>`;
        }

        const gameIcon = gameIcons[room.game] || '🎮';

        card.innerHTML = `
          <div class="room-card__header">
            <span class="room-card__game">${gameIcon} ${room.game}</span>
            ${statusHtml}
          </div>
          <div class="room-card__info">
            <span>👤 ${room.players.length}/${room.maxPlayers}</span>
            <span>💰 $${room.stake}</span>
            ${timerHtml}
          </div>
          <div class="room-card__actions">${actionHtml}</div>
        `;

        if (!isAuthenticated) return;
        
        if (room.status === 'pending') {
          if (!user.inRoomId && card.querySelector('.room-card__action--join')) {
            card.querySelector('.room-card__action--join').onclick = () => {
              if (user.balance < room.stake) return alert('Not enough balance!');
              room.players.push(user.id);
              user.inRoomId = room.id;
              user.balance -= room.stake;
              updateBalance();
              if (room.players.length === room.maxPlayers) {
                room.status = 'inplay';
                room.timer = 300;
                room.ready = [];
                room.joinedServer = [];
                saveRooms(rooms);
                startTimer(room.id);
              }
              saveRooms(rooms);
              renderRooms();
            };
          } else if (isUserHere && card.querySelector('.room-card__action--quit')) {
            card.querySelector('.room-card__action--quit').onclick = () => {
              room.players = room.players.filter(uid => uid !== user.id);
              user.inRoomId = null;
              user.balance += room.stake;
              updateBalance();
              saveRooms(rooms);
              renderRooms();
            };
          }
        } else if (room.status === 'inplay' && isUserHere) {
          const isReady = room.ready && room.ready.includes(user.id);
          if (!isReady) {
            card.querySelector('.room-card__action--quit').onclick = () => {
              room.players = room.players.filter(uid => uid !== user.id);
              user.inRoomId = null;
              user.balance += room.stake;
              updateBalance();
              if (room.players.length < room.maxPlayers) {
                room.status = 'pending';
                room.timer = null;
                room.ready = [];
                room.joinedServer = [];
                stopTimer(room.id);
              }
              saveRooms(rooms);
              renderRooms();
            };
            card.querySelector('.room-card__action--ready').onclick = () => {
              if (!room.ready.includes(user.id)) {
                room.ready.push(user.id);
                saveRooms(rooms);
                renderRooms();
              }
            };
          } else {
            card.querySelector('.room-card__action--server').onclick = () => {
              if (!room.joinedServer) room.joinedServer = [];
              if (!room.joinedServer.includes(user.id)) {
                const server = cybershokeDuelServers[Math.floor(Math.random() * cybershokeDuelServers.length)];
                window.open('steam://connect/' + server.ip, '_blank');
                room.joinedServer.push(user.id);
                if (room.joinedServer.length === 2) {
                  room.status = 'ingame';
                  room.timer = null;
                  stopTimer(room.id);
                  saveRooms(rooms);
                  setTimeout(() => {
                    simulateGameResults(room);
                  }, 3000);
                } else {
                  saveRooms(rooms);
                  renderRooms();
                }
              }
            };
          }
        }

        roomsList.appendChild(card);
      });
  }

  function startTimer(roomId) {
    stopTimer(roomId);
    timerIntervals[roomId] = setInterval(() => {
      let rooms = loadRooms();
      const room = rooms.find(r => r.id === roomId);
      if (!room || room.status !== 'inplay') {
        stopTimer(roomId);
        return;
      }
      if (room.timer > 0) {
        room.timer--;
        if (room.timer === 0) {
          room.players.forEach(uid => {
            if (uid === user.id) {
              user.balance += room.stake;
              user.inRoomId = null;
              updateBalance();
            }
          });
          const idx = rooms.findIndex(r => r.id === roomId);
          rooms.splice(idx, 1);
          stopTimer(roomId);
        }
        saveRooms(rooms);
        renderRooms();
      }
    }, 1000);
  }
  
  function stopTimer(roomId) {
    clearInterval(timerIntervals[roomId]);
    timerIntervals[roomId] = null;
  }
  
  function simulateGameResults(room) {
    if (!room.players.includes(user.id)) return;
    user.stats.totalGames++;
    const userKills = Math.floor(Math.random() * 30) + 5;
    const userDeaths = Math.floor(Math.random() * 25) + 3;
    const userHeadshots = Math.floor(Math.random() * userKills * 0.7);
    const userShotsFired = userKills * 4 + Math.floor(Math.random() * 100);
    const userShotsHit = userKills + Math.floor(Math.random() * 50);
    const didWin = Math.random() > 0.5;
    user.stats.kills += userKills;
    user.stats.deaths += userDeaths;
    user.stats.headshots += userHeadshots;
    user.stats.shotsFired += userShotsFired;
    user.stats.shotsHit += userShotsHit;
    if (didWin) {
      user.stats.wins++;
      user.balance += room.stake * 2;
      user.stats.earnings += room.stake;
      updateBalance();
    }
    const matchDate = new Date().toISOString();
    user.matchHistory.unshift({
      id: Date.now(),
      game: room.game,
      date: matchDate,
      result: didWin ? 'win' : 'loss',
      stake: room.stake,
      kills: userKills,
      deaths: userDeaths,
      headshots: userHeadshots
    });
    if (user.matchHistory.length > 10) {
      user.matchHistory = user.matchHistory.slice(0, 10);
    }
    saveUserStats();
    let rooms = loadRooms();
    const roomIdx = rooms.findIndex(r => r.id === room.id);
    if (roomIdx !== -1) {
      rooms[roomIdx].joinedServer = [];
      user.inRoomId = null;
      if (!rooms[roomIdx].gameFinished) {
        rooms[roomIdx].gameFinished = [user.id];
      } else if (Array.isArray(rooms[roomIdx].gameFinished) && !rooms[roomIdx].gameFinished.includes(user.id)) {
        rooms[roomIdx].gameFinished.push(user.id);
      }
      if (rooms[roomIdx].gameFinished.length === rooms[roomIdx].players.length) {
        rooms.splice(roomIdx, 1);
      } else {
        saveRooms(rooms);
      }
    }
    renderRooms();
    alert(`Game finished! You ${didWin ? 'won' : 'lost'}!\nKills: ${userKills}, Deaths: ${userDeaths}`);
  }

  createRoomBtn.onclick = () => {
    if (!isAuthenticated) {
      alert('Please sign in through Steam to create rooms');
      return;
    }
    
    if (user.inRoomId) {
      alert('You are already in a room!');
      return;
    }
    
    createRoomModal.style.display = 'flex';
    modalSelect.value = 'CS2';
    modalInput.value = '';
  };
  
  depositBtn.onclick = () => {
    if (!isAuthenticated) {
      alert('Please sign in through Steam to manage your balance');
      return;
    }
    
    depositModal.style.display = 'flex';
    document.getElementById('deposit-amount').value = '';
  };
  
  withdrawBtn.onclick = () => {
    if (!isAuthenticated) {
      alert('Please sign in through Steam to manage your balance');
      return;
    }
    
    withdrawModal.style.display = 'flex';
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-details').value = '';
  };
  
  profileLink.onclick = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please sign in through Steam to view your profile');
      return;
    }
    
    openProfileModal();
  };
  
  function openProfileModal() {
    document.getElementById('profile-username').textContent = user.steamUsername;
    document.getElementById('profile-avatar').src = user.steamAvatar;
    document.getElementById('profile-balance').textContent = `$${user.balance}`;
    
    updateStatsDisplay();
    
    profileModal.style.display = 'flex';
  }
  
  function updateStatsDisplay() {
    const winRate = user.stats.totalGames > 0 ? Math.round((user.stats.wins / user.stats.totalGames) * 100) : 0;
    const kdRatio = user.stats.deaths > 0 ? (user.stats.kills / user.stats.deaths).toFixed(2) : user.stats.kills.toFixed(2);
    const hsPercentage = user.stats.kills > 0 ? Math.round((user.stats.headshots / user.stats.kills) * 100) : 0;
    const accuracy = user.stats.shotsFired > 0 ? Math.round((user.stats.shotsHit / user.stats.shotsFired) * 100) : 0;
    
    document.getElementById('stats-total-games').textContent = user.stats.totalGames;
    document.getElementById('stats-wins').textContent = user.stats.wins;
    document.getElementById('stats-winrate').textContent = `${winRate}%`;
    document.getElementById('stats-kd').textContent = kdRatio;
    document.getElementById('stats-hs').textContent = `${hsPercentage}%`;
    document.getElementById('stats-earnings').textContent = `$${user.stats.earnings}`;
    
    document.getElementById('stats-kills').textContent = user.stats.kills;
    document.getElementById('stats-deaths').textContent = user.stats.deaths;
    document.getElementById('stats-headshots').textContent = user.stats.headshots;
    document.getElementById('stats-accuracy').textContent = `${accuracy}%`;
    
    const historyList = document.getElementById('match-history');
    historyList.innerHTML = '';
    
    if (user.matchHistory.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No matches played yet</div>';
    } else {
      user.matchHistory.forEach(match => {
        const matchItem = document.createElement('div');
        matchItem.className = 'history-item';
        
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' });
        
        const gameIcon = gameIcons[match.game] || '🎮';
        
        matchItem.innerHTML = `
          <div class="history-game">${gameIcon} ${match.game}</div>
          <div class="history-details">K/D: ${match.kills}/${match.deaths}</div>
          <div class="history-result history-result--${match.result}">${match.result === 'win' ? 'Win' : 'Loss'} $${match.result === 'win' ? '+' + match.stake : '-' + match.stake}</div>
        `;
        
        historyList.appendChild(matchItem);
      });
    }
  }
  
  if (profileDepositBtn) {
    profileDepositBtn.onclick = () => {
      profileModal.style.display = 'none';
      depositModal.style.display = 'flex';
      document.getElementById('deposit-amount').value = '';
    };
  }
  
  if (profileWithdrawBtn) {
    profileWithdrawBtn.onclick = () => {
      profileModal.style.display = 'none';
      withdrawModal.style.display = 'flex';
      document.getElementById('withdraw-amount').value = '';
      document.getElementById('withdraw-details').value = '';
    };
  }

  function closeAllModals() {
    createRoomModal.style.display = 'none';
    depositModal.style.display = 'none';
    withdrawModal.style.display = 'none';
    profileModal.style.display = 'none';
    filterModal.style.display = 'none';
  }
  
  modalCloseButtons.forEach(btn => {
    btn.onclick = closeAllModals;
  });
  
  modalCancelButtons.forEach(btn => {
    btn.onclick = closeAllModals;
  });
  
  window.onclick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
      closeAllModals();
    }
  };

  modalCreate.onclick = () => {
    const game = modalSelect.value;
    const stake = parseInt(modalInput.value, 10);
    if (!game || !stake || stake < 1) return alert('Please enter a valid bet amount!');
    if (user.balance < stake) return alert('Not enough balance!');
    let rooms = loadRooms();
    const newRoom = {
      id: Date.now(),
      game,
      players: [user.id],
      maxPlayers: 2,
      stake,
      status: 'pending',
      timer: null,
      ready: []
    };
    rooms.push(newRoom);
    user.inRoomId = newRoom.id;
    user.balance -= stake;
    updateBalance();
    saveRooms(rooms);
    closeAllModals();
    renderRooms();
  };
  
  depositConfirmBtn.onclick = () => {
    const amount = parseInt(document.getElementById('deposit-amount').value, 10);
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!amount || amount < 100) {
      alert('Please enter a valid amount (minimum 100 RUB)');
      return;
    }
    
    const commission = Math.ceil(amount * 0.02);
    const amountAfterCommission = amount - commission;
    const dollars = Math.floor(amountAfterCommission / 100);
    
    user.balance += dollars;
    updateBalance();
    closeAllModals();
    
    alert(`Deposit successful!\nAmount: ${amount} RUB\nCommission: ${commission} RUB\nAdded to balance: $${dollars}`);
  };
  
  withdrawConfirmBtn.onclick = () => {
    const amount = parseInt(document.getElementById('withdraw-amount').value, 10);
    const withdrawMethod = document.getElementById('withdraw-method').value;
    const withdrawDetails = document.getElementById('withdraw-details').value;
    
    if (!amount || amount < 100) {
      alert('Please enter a valid amount (minimum 100 RUB)');
      return;
    }
    
    if (!withdrawDetails) {
      alert('Please enter your payment details');
      return;
    }
    
    const requiredBalance = Math.ceil(amount / 100);
    
    if (user.balance < requiredBalance) {
      alert('Not enough balance for this withdrawal');
      return;
    }
    
    const commission = Math.ceil(amount * 0.02);
    const amountAfterCommission = amount - commission;
    
    user.balance -= requiredBalance;
    updateBalance();
    closeAllModals();
    
    alert(`Withdrawal request submitted!\nAmount: ${amount} RUB\nCommission: ${commission} RUB\nSubtracted from balance: $${requiredBalance}\nPayment will be sent to: ${withdrawDetails}`);
  };

  filterBtn.onclick = () => {
    if (!isAuthenticated) {
      alert('Please sign in through Steam to use filters');
      return;
    }
    
    filterGame.value = filters.game;
    filterMinBet.value = filters.minBet > 0 ? filters.minBet : '';
    filterMaxBet.value = filters.maxBet < Infinity ? filters.maxBet : '';
    
    filterModal.style.display = 'flex';
  };
  
  filterApply.onclick = () => {
    filters.game = filterGame.value;
    filters.minBet = filterMinBet.value ? parseInt(filterMinBet.value, 10) : 0;
    filters.maxBet = filterMaxBet.value ? parseInt(filterMaxBet.value, 10) : Infinity;
    
    filterModal.style.display = 'none';
    renderRooms();
  };
  
  filterReset.onclick = () => {
    filterGame.value = '';
    filterMinBet.value = '';
    filterMaxBet.value = '';
    
    filters.game = '';
    filters.minBet = 0;
    filters.maxBet = Infinity;
    
    renderRooms();
    
    filterModal.style.display = 'none';
  };

  searchInput.oninput = renderRooms;

  steamLoginBtn.onclick = authenticateWithSteam;
  steamLoginMainBtn.onclick = authenticateWithSteam;
  
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  if (loadRooms().length === 0) {
    const demoRooms = [
      {
        id: Date.now(),
        game: 'CS2',
        players: ['demo-user-1'],
        maxPlayers: 2,
        stake: 100,
        status: 'pending',
        timer: null,
        ready: []
      },
      {
        id: Date.now() + 1,
        game: 'CS2',
        players: ['demo-user-2', 'demo-user-3'],
        maxPlayers: 2,
        stake: 250,
        status: 'inplay',
        timer: 280,
        ready: ['demo-user-2']
      },
      {
        id: Date.now() + 2,
        game: 'CS2',
        players: ['demo-user-4', 'demo-user-5'],
        maxPlayers: 2,
        stake: 500,
        status: 'ingame',
        timer: null,
        ready: ['demo-user-4', 'demo-user-5']
      }
    ];
    saveRooms(demoRooms);
    
    demoRooms.forEach(room => {
      if (room.status === 'inplay') {
        startTimer(room.id);
      }
    });
  }

  renderRooms();
  
  function logout() {
    isAuthenticated = false;
    user.inRoomId = null;
    
    let rooms = loadRooms();
    let userRoom = rooms.find(room => room.players.includes(user.id));
    if (userRoom) {
      if (userRoom.players.length === 1) {
        rooms = rooms.filter(r => r.id !== userRoom.id);
      } else {
        userRoom.players = userRoom.players.filter(id => id !== user.id);
        
        if (userRoom.status === 'inplay' || userRoom.status === 'ingame') {
          userRoom.status = 'pending';
          userRoom.timer = null;
          userRoom.ready = [];
          stopTimer(userRoom.id);
        }
      }
      saveRooms(rooms);
    }
    
    updateAuthUI();
    
    localStorage.removeItem('fastpvp_authenticated');
    localStorage.removeItem('fastpvp_steamname');
    localStorage.removeItem('fastpvp_steamavatar');
    
    alert("You have been logged out successfully.");
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('.ad-banner__slide');
  const dots = document.querySelectorAll('.ad-banner__dot');
  let current = 0;
  function showSlide(idx) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('ad-banner__slide--active', i === idx);
      dots[i].classList.toggle('ad-banner__dot--active', i === idx);
    });
    current = idx;
  }
  document.getElementById('ad-banner-prev').onclick = function() {
    showSlide((current - 1 + slides.length) % slides.length);
  };
  document.getElementById('ad-banner-next').onclick = function() {
    showSlide((current + 1) % slides.length);
  };
  dots.forEach((dot, i) => {
    dot.onclick = () => showSlide(i);
  });
});