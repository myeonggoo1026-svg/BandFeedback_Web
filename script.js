/* 페이지별 연동 */
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

/* 화면 전환 함수 */
function show(target) {
  [
    home,
    typeSelect,
    ensembleOption,
    partSelect,
    readFeedback,
    feedbackForm,
    bandFeedbackForm,
  ].forEach((s) => s.classList.add('hidden'));
  target.classList.remove('hidden');
}

/* 뒤로 가기 */
document.querySelectorAll('.backBtn').forEach((btn) => {
  btn.onclick = () => {
    show(document.getElementById(btn.dataset.target));
  };
});

/* ENTER 버튼 */
enterBtn.onclick = () => {
  show(typeSelect);
};

/* 타입 선택 */
document.querySelector('.inputcard').onclick = () => {
  show(ensembleOption);
};

document.querySelector('.readcard').onclick = () => {
  show(readFeedback);
};

/* + 버튼 -> 달력 열기 */
addEnsembleBtn.onclick = () => {
  ensembleDateInput.classList.remove('hidden');
  ensembleDateInput.focus(); // 입력칸만 보여줌
};

/* 날짜 선택 시 카드 생성 */
ensembleDateInput.onchange = () => {
  const date = ensembleDateInput.value;
  if (!date) return;

  const card = document.createElement('div');
  card.className = 'ensembleCard';

  const text = document.createElement('span');
  text.className = 'ensembleDateText';
  text.innerText = `합주 날짜: ${date}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'deleteBtn';
  deleteBtn.innerText = '✕';

  /* 삭제 버튼 클릭 */
  deleteBtn.onclick = (e) => {
    e.stopPropagation(); // 카드 클릭 방지
    card.remove();
  };

  /* 카드 클릭 → 다음 단계 */
  card.onclick = () => {
    show(partSelect);
  };

  card.appendChild(text);
  card.appendChild(deleteBtn);
  ensembleList.appendChild(card);

  ensembleDateInput.value = '';
  ensembleDateInput.classList.add('hidden');
};

/* INPUT 버튼 */
document.querySelectorAll('.inputMemberBtn').forEach((btn) => {
  btn.onclick = () => {
    show(feedbackForm);
  };
});

document.querySelectorAll('.inputBandBtn').forEach((btn) => {
  btn.onclick = () => {
    show(bandFeedbackForm);
  };
});
