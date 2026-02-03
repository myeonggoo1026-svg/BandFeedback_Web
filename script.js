/* ---------------- DOM 요소 ---------------- */
const home = document.getElementById('home');
const typeSelect = document.getElementById('typeSelect');
const ensembleOption = document.getElementById('ensembleOption');
const partSelect = document.getElementById('partSelect');
const readFeedback = document.getElementById('readFeedback');
const addEnsembleBtn = document.getElementById('addEnsembleBtn');
const ensembleDateInput = document.getElementById('ensembleDate');
const ensembleList = document.getElementById('ensembleList');
const feedbackForm = document.getElementById('feedbackForm');
const bandFeedbackForm = document.getElementById('bandFeedbackForm');
const memberReadDateSelect = document.getElementById('memberReadDateSelect');
const memberReadDateList = document.getElementById('memberReadDateList');
const memberPartSelect = document.getElementById('memberPartSelect');
const memberFeedbackRead = document.getElementById('memberFeedbackRead');
const bandReadDateSelect = document.getElementById('bandReadDateSelect');
const bandFeedbackRead = document.getElementById('bandFeedbackRead');

/* ---------------- 전역 변수 ---------------- */
let selectedDate = '';
let selectedMember = '';

/* ---------------- 화면 전환 ---------------- */
function show(target) {
  [
    home,
    typeSelect,
    ensembleOption,
    partSelect,
    readFeedback,
    feedbackForm,
    bandFeedbackForm,
    memberReadDateSelect,
    memberPartSelect,
    memberFeedbackRead,
    bandReadDateSelect,
    bandFeedbackRead,
  ].forEach((s) => s.classList.add('hidden'));
  target.classList.remove('hidden');
}

/* 홈화면 영상 재생 */
const videos = [
  'BandFeedback_asset/video1.mp4',
  'BandFeedback_asset/video2.mp4',
  'BandFeedback_asset/video3.mp4',
  'BandFeedback_asset/video4.mp4',
  'BandFeedback_asset/video5.mp4',
  'BandFeedback_asset/video6.mp4',
  'BandFeedback_asset/video7.mp4',
];

const videoA = document.getElementById('videoA');
const videoB = document.getElementById('videoB');

let currentIndex = 0;
let isAActive = true;

function playNextVideo() {
  const current = isAActive ? videoA : videoB;
  const next = isAActive ? videoB : videoA;

  next.src = videos[currentIndex];
  next.load();

  next.onloadedmetadata = () => {
    next.currentTime = 0;
    next.play();

    next.classList.add('active');
    current.classList.remove('active');

    setTimeout(() => {
      current.pause();
      current.currentTime = 0;
    }, 1500); // 페이드 끝난 뒤 정지

    currentIndex = (currentIndex + 1) % videos.length;
    isAActive = !isAActive;
  };
}

/* 초기 실행도 이 함수로 통일 */
playNextVideo();

/* 이후부터 5초마다 교체 */
setInterval(playNextVideo, 5000);

/* 뒤로가기 버튼 */
document.querySelectorAll('.backBtn').forEach((btn) => {
  btn.onclick = () => show(document.getElementById(btn.dataset.target));
});

/* ENTER 버튼 */
const enterBtn = document.getElementById('enterBtn');
if (enterBtn) enterBtn.onclick = () => show(typeSelect);

/* 타입 선택 1 */
document.querySelector('.inputcard').onclick = () => show(ensembleOption);
document.querySelector('.readcard').onclick = () => {
  show(readFeedback);
  loadFeedbackCards(); // 피드백 읽기 시 DB에서 자동 생성
};

/* 타입 선택 2 */
document.querySelector('.readfeedcard').onclick = () => {
  show(memberReadDateSelect);
  loadMemberFeedbackDates();
};

document.querySelector('.suggestionfeedcard').onclick = () => {
  show(bandReadDateSelect);
  loadBandFeedbackDates();
};

/* + 버튼 -> 달력 열기 */
addEnsembleBtn.onclick = () => {
  ensembleDateInput.classList.remove('hidden');
  ensembleDateInput.focus();
};

/* ---------------- 날짜 선택 시 카드 생성 ---------------- */
ensembleDateInput.onchange = async () => {
  const date = ensembleDateInput.value;
  if (!date) return;

  selectedDate = date;

  const card = document.createElement('div');
  card.className = 'ensembleCard';

  const text = document.createElement('span');
  text.className = 'ensembleDateText';
  text.innerText = `합주 날짜: ${date}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'deleteBtn';
  deleteBtn.innerText = '✕';

  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    try {
      // DB 삭제
      const memberDelete = await fetch(
        `http://localhost:8080/api/feedback/member/all?date=${date}`,
        { method: 'DELETE' },
      );
      const bandDelete = await fetch(
        `http://localhost:8080/api/feedback/band/all?date=${date}`,
        { method: 'DELETE' },
      );

      if (memberDelete.ok && bandDelete.ok) {
        // 카드 제거
        card.remove();

        // 입력 화면에서도 동일한 날짜 카드 제거
        const inputCard = Array.from(ensembleList.children).find((c) =>
          c.querySelector('.ensembleDateText')?.innerText.includes(date),
        );
        if (inputCard) inputCard.remove();

        if (selectedDate === date) selectedDate = '';
        alert('삭제 완료!');
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error(error);
      alert('서버 연결 확인 필요!');
    }
  };

  card.onclick = () => show(partSelect);

  card.appendChild(text);
  card.appendChild(deleteBtn);
  ensembleList.appendChild(card);

  ensembleDateInput.value = '';
  ensembleDateInput.classList.add('hidden');
};

/* ---------------- 파트 선택 ---------------- */
document.querySelectorAll('.partcard').forEach((card) => {
  card.onclick = () => {
    if (card.querySelector('.inputBandBtn')) {
      show(bandFeedbackForm);
    } else {
      selectedMember = card.dataset.member || card.innerText.split(' ')[0];
      show(feedbackForm);
    }
  };
});

/* ---------------- DB 전송 ---------------- */
async function submitMemberFeedback() {
  const formData = {
    ensembleDate: selectedDate || new Date().toISOString().split('T')[0],
    targetMember: selectedMember,
    skillFeedback: document.querySelector('textarea[name="skillFeedback"]')
      .value,
    rhythmFeedback: document.querySelector('textarea[name="rhythmFeedback"]')
      .value,
    toneFeedback: document.querySelector('textarea[name="toneFeedback"]').value,
    extraFeedback: document.querySelector('textarea[name="extraFeedback"]')
      .value,
  };

  if (!formData.targetMember) {
    alert('리뷰할 멤버가 선택되지 않았습니다!');
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/feedback/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert('멤버 피드백 저장 완료!');
      show(typeSelect);
    } else alert('저장 실패');
  } catch {
    alert('서버 확인 필요!');
  }
}

async function submitBandFeedback() {
  const formData = {
    ensembleDate: selectedDate || new Date().toISOString().split('T')[0],
    atmosphereFeedback: document.querySelector(
      'textarea[name="atmosphereFeedback"]',
    ).value,
    performanceFeedback: document.querySelector(
      'textarea[name="performanceFeedback"]',
    ).value,
    environmentFeedback: document.querySelector(
      'textarea[name="environmentFeedback"]',
    ).value,
    suggestions: document.querySelector('textarea[name="suggestions"]').value,
  };

  try {
    const res = await fetch('http://localhost:8080/api/feedback/band', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert('밴드 피드백 저장 완료!');
      show(typeSelect);
    } else alert('저장 실패');
  } catch {
    alert('서버 확인 필요!');
  }
}

/* ---------------- 멤버 피드백 날짜 카드 로드 ---------------- */
async function loadMemberFeedbackDates() {
  memberReadDateList.innerHTML = '';

  try {
    const res = await fetch('http://localhost:8080/api/feedback/member/dates');
    if (!res.ok) {
      alert('날짜 목록 불러오기 실패');
      return;
    }

    const dates = await res.json();

    if (dates.length === 0) {
      memberReadDateList.innerHTML =
        '<p style="opacity:0.7;">저장된 피드백이 없습니다.</p>';
      return;
    }

    dates.forEach((date) => {
      const card = document.createElement('div');
      card.className = 'ensembleCard';

      const text = document.createElement('span');
      text.className = 'ensembleDateText';
      text.innerText = `합주 날짜: ${date}`;

      /* 삭제 버튼 추가 */
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'deleteBtn';
      deleteBtn.innerText = '✕';

      deleteBtn.onclick = async (e) => {
        e.stopPropagation(); // 카드 클릭 방지

        if (!confirm('해당 날짜의 모든 멤버 피드백을 삭제하시겠습니까?'))
          return;

        try {
          const res = await fetch(
            `http://localhost:8080/api/feedback/member/all?date=${date}`,
            { method: 'DELETE' },
          );

          if (res.ok) {
            card.remove();
            if (selectedDate === date) selectedDate = '';
            alert('삭제 완료');
          } else {
            alert('삭제 실패');
          }
        } catch (err) {
          console.error(err);
          alert('서버 연결 오류');
        }
      };

      card.appendChild(text);
      card.appendChild(deleteBtn);

      /* 날짜 선택 */
      card.onclick = () => {
        selectedDate = date;
        show(memberPartSelect);
      };

      memberReadDateList.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    alert('서버 연결 오류');
  }
}

/* ---------------- 멤버 피드백 Read ---------------- */
document.querySelectorAll('.readMemberBtn').forEach((btn) => {
  btn.onclick = async (e) => {
    e.stopPropagation();

    const card = btn.closest('.partfeedbackcard');
    const member = card.dataset.member;

    selectedMember = member;

    try {
      const res = await fetch(
        `http://localhost:8080/api/feedback/member?date=${selectedDate}`,
      );
      if (!res.ok) {
        alert('피드백 조회 실패');
        return;
      }

      const list = await res.json();

      const feedback = list.find((f) => f.targetMember === selectedMember);

      if (!feedback) {
        alert('해당 멤버의 피드백이 없습니다.');
        return;
      }

      // 화면 채우기
      document.getElementById('readMemberName').innerText = selectedMember;
      document.getElementById('readEnsembleDate').innerText =
        `합주 날짜: ${selectedDate}`;

      document.getElementById('read_skill').innerText =
        feedback.skillFeedback || '없음';
      document.getElementById('read_rhythm').innerText =
        feedback.rhythmFeedback || '없음';
      document.getElementById('read_tone').innerText =
        feedback.toneFeedback || '없음';
      document.getElementById('read_extra').innerText =
        feedback.extraFeedback || '없음';

      show(memberFeedbackRead);
    } catch (e) {
      console.error(e);
      alert('서버 연결 오류');
    }
  };
});

/* ---------------- 밴드 피드백 날짜 카드 로드 ---------------- */
async function loadBandFeedbackDates() {
  const bandReadDateList = document.getElementById('bandReadDateList');
  bandReadDateList.innerHTML = '';

  try {
    const res = await fetch('http://localhost:8080/api/feedback/band/dates');
    if (!res.ok) {
      alert('밴드 날짜 목록 불러오기 실패');
      return;
    }

    const dates = await res.json();

    if (dates.length === 0) {
      bandReadDateList.innerHTML =
        '<p style="opacity:0.7;">저장된 밴드 피드백이 없습니다.</p>';
      return;
    }

    dates.forEach((date) => {
      const card = document.createElement('div');
      card.className = 'ensembleCard';

      const text = document.createElement('span');
      text.className = 'ensembleDateText';
      text.innerText = `합주 날짜: ${date}`;

      /* 삭제 버튼 추가 */
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'deleteBtn';
      deleteBtn.innerText = '✕';

      deleteBtn.onclick = async (e) => {
        e.stopPropagation(); // 카드 클릭 방지

        if (!confirm('해당 날짜의 밴드 피드백을 삭제하시겠습니까?')) return;

        try {
          const res = await fetch(
            `http://localhost:8080/api/feedback/band/all?date=${date}`,
            { method: 'DELETE' },
          );

          if (res.ok) {
            card.remove();
            if (selectedDate === date) selectedDate = '';
            alert('삭제 완료');
          } else {
            alert('삭제 실패');
          }
        } catch (err) {
          console.error(err);
          alert('서버 연결 오류');
        }
      };

      card.appendChild(text);
      card.appendChild(deleteBtn);

      /* 날짜 클릭 → 피드백 읽기 */
      card.onclick = () => {
        selectedDate = date;
        loadBandFeedbackRead();
      };

      bandReadDateList.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    alert('서버 연결 오류');
  }
}

/* ---------------- 밴드 피드백 Read ---------------- */
async function loadBandFeedbackRead() {
  try {
    const res = await fetch(
      `http://localhost:8080/api/feedback/band?date=${selectedDate}`,
    );

    if (!res.ok) {
      alert('밴드 피드백 조회 실패');
      return;
    }

    const list = await res.json();
    if (list.length === 0) {
      alert('해당 날짜의 밴드 피드백이 없습니다.');
      return;
    }

    const feedback = list[0]; // 날짜당 1개 구조

    document.getElementById('readEnsembleDate').innerText =
      `합주 날짜: ${selectedDate}`;

    document.getElementById('read_atmosphere').innerText =
      feedback.atmosphereFeedback || '없음';
    document.getElementById('read_performance').innerText =
      feedback.performanceFeedback || '없음';
    document.getElementById('read_environment').innerText =
      feedback.environmentFeedback || '없음';
    document.getElementById('read_suggestions').innerText =
      feedback.suggestions || '없음';

    show(bandFeedbackRead);
  } catch (e) {
    console.error(e);
    alert('서버 연결 오류');
  }
}
