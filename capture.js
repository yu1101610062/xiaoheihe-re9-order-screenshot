const captureTrigger = document.getElementById("capture-trigger");
const modal = document.getElementById("cdkey-modal");
const input = document.getElementById("cdkey-input");
const confirmBtn = document.getElementById("cdkey-confirm");
const cancelBtn = document.getElementById("cdkey-cancel");
const codeText = document.querySelector(".code-text");

function openModal() {
  input.value = "XXXXX-XXXXX-XXXXX";
  modal.classList.remove("hidden");
  input.focus();
  input.select();
}

function closeModal() {
  modal.classList.add("hidden");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function captureAndDownload(cdkey) {
  if (window.location.protocol === "file:") {
    alert("请先启动Node截图服务，并通过 http://localhost:3000 打开页面。");
    return;
  }
  try {
    const response = await fetch("/screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cdkey }),
    });
    if (!response.ok) {
      alert("截图失败，请确认截图服务已启动。");
      return;
    }
    const blob = await response.blob();
    downloadBlob(blob, "订单截图.png");
  } catch (error) {
    console.error(error);
    alert("截图失败，请确认截图服务已启动。");
  }
}

captureTrigger.addEventListener("click", openModal);
cancelBtn.addEventListener("click", closeModal);

confirmBtn.addEventListener("click", async () => {
  const value = input.value.trim();
  if (!value) {
    alert("请输入CDKEY。");
    input.focus();
    return;
  }
  codeText.textContent = value;
  closeModal();
  await captureAndDownload(value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    confirmBtn.click();
  }
  if (event.key === "Escape") {
    closeModal();
  }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
