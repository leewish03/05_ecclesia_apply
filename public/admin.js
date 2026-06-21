const accessCodeInput = document.querySelector("#adminAccessCode");
const loadButton = document.querySelector("#loadAdmin");
const refreshButton = document.querySelector("#refreshAdmin");
const adminMessage = document.querySelector("#adminMessage");
const adminList = document.querySelector("#adminList");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setAdminMessage(text, type = "") {
  adminMessage.textContent = text;
  adminMessage.dataset.type = type;
}

function formatPhoneNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function renderAdminRows(registrations) {
  if (registrations.length === 0) {
    adminList.innerHTML = '<p class="empty">아직 응답이 없습니다.</p>';
    return;
  }

  adminList.innerHTML = registrations
    .map(
      (item) => `
        <article class="admin-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.church)} · ${escapeHtml(item.gender)}</small>
          </div>
          <dl>
            <div><dt>전화번호</dt><dd>${escapeHtml(formatPhoneNumber(item.phone))}</dd></div>
            <div><dt>구원 여부</dt><dd>${item.isSaved ? "예" : "아니오"}</dd></div>
            <div><dt>침례 여부</dt><dd>${item.isBaptized ? "예" : "아니오"}</dd></div>
            <div><dt>입금 확인</dt><dd>${item.paymentConfirmed ? "완료" : "미완료"}</dd></div>
            <div><dt>신청일</dt><dd>${new Date(item.createdAt).toLocaleString("ko-KR")}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

async function loadAdminRows() {
  const accessCode = accessCodeInput.value;
  setAdminMessage("불러오는 중입니다...");

  try {
    const response = await fetch("/api/admin/registrations", {
      headers: { "x-admin-access-code": accessCode },
    });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.message || "관리자 조회에 실패했습니다.");
    }

    renderAdminRows(body.registrations);
    setAdminMessage(`총 ${body.registrations.length}개의 응답을 불러왔습니다.`, "success");
  } catch (error) {
    setAdminMessage(error.message, "error");
  }
}

loadButton.addEventListener("click", loadAdminRows);
refreshButton.addEventListener("click", loadAdminRows);
accessCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadAdminRows();
  }
});
