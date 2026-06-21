const ACCOUNT_NUMBER = "3333334743437";

const form = document.querySelector("#registrationForm");
const message = document.querySelector("#message");
const copyAccount = document.querySelector("#copyAccount");
const participantsDialog = document.querySelector("#participantsDialog");
const participantsList = document.querySelector("#participantsList");
const participantCount = document.querySelector("#participantCount");
const phoneInput = document.querySelector("#phone");

function normalizePhoneDigits(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 11);
}

function formatPhoneNumber(value) {
  const digits = normalizePhoneDigits(value);

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

function setMessage(text, type = "") {
  message.textContent = text;
  message.dataset.type = type;
}

function formToPayload() {
  const data = new FormData(form);

  return {
    name: data.get("name"),
    church: data.get("church"),
    phone: data.get("phone"),
    gender: data.get("gender"),
    isSaved: data.get("isSaved"),
    isBaptized: data.get("isBaptized"),
    paymentConfirmed: data.get("paymentConfirmed") === "on",
  };
}

function renderParticipants(registrations) {
  if (registrations.length === 0) {
    participantsList.innerHTML = '<p class="empty">아직 신청자가 없습니다.</p>';
    participantCount.textContent = "0명 신청";
    return;
  }

  participantCount.textContent = `${registrations.length}명 신청`;

  participantsList.innerHTML = registrations
    .map(
      (item, index) => `
        <article class="participant-row">
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.church)}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadParticipants() {
  participantsList.innerHTML = '<p class="empty">불러오는 중입니다...</p>';

  if (!participantsDialog.open) {
    participantsDialog.showModal();
  }

  try {
    const response = await fetch("/api/public-registrations");
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.message || "신청자 목록을 불러오지 못했습니다.");
    }

    renderParticipants(body.registrations);
  } catch (error) {
    participantsList.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`;
    participantCount.textContent = "조회 실패";
  }
}

function syncChoiceState(groupName) {
  document.querySelectorAll(`input[name="${groupName}"]`).forEach((input) => {
    input.closest(".choice").classList.toggle("selected", input.checked);
  });
}

document.querySelectorAll('.choice input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    syncChoiceState(radio.name);
  });
});

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatPhoneNumber(phoneInput.value);
});

document.querySelector('.confirm-payment input').addEventListener("change", (event) => {
  event.currentTarget.closest(".confirm-payment").classList.toggle("selected", event.currentTarget.checked);
});

copyAccount.addEventListener("click", async () => {
  await navigator.clipboard.writeText(ACCOUNT_NUMBER);
  setMessage("계좌번호가 복사되었습니다.", "success");
});

document.querySelector("#openParticipants").addEventListener("click", loadParticipants);
document.querySelector("#closeParticipants").addEventListener("click", () => participantsDialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("신청을 저장하는 중입니다...");

  try {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formToPayload()),
    });
    const body = await response.json();

    if (!response.ok) {
      const firstError = body.errors ? Object.values(body.errors)[0] : body.message;
      throw new Error(firstError || "신청 저장에 실패했습니다.");
    }

    form.reset();
    document.querySelector('input[name="gender"][value="남"]').checked = true;
    document.querySelector('input[name="isSaved"][value="yes"]').checked = true;
    document.querySelector('input[name="isBaptized"][value="yes"]').checked = true;
    ["gender", "isSaved", "isBaptized"].forEach(syncChoiceState);
    document.querySelector(".confirm-payment").classList.remove("selected");
    setMessage("신청이 완료되었습니다.", "success");
  } catch (error) {
    setMessage(error.message, "error");
  }
});
