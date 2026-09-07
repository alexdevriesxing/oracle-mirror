const pendulumPanel = document.querySelector(".io-pendulum");
if (pendulumPanel && !pendulumPanel.querySelector("[data-divination-pendulum-guide]")) {
  const guide = document.createElement("p");
  guide.className = "io-small";
  guide.dataset.divinationPendulumGuide = "true";
  guide.innerHTML = '<a href="/divination/pendulum">How pendulum reflection works →</a>';
  const result = pendulumPanel.querySelector("[data-pendulum-result]");
  if (result) pendulumPanel.insertBefore(guide, result);
  else pendulumPanel.appendChild(guide);
}

export {};
