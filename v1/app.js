const form = document.querySelector("#order-form");
const status = document.querySelector("#status");
const storageKey = "fairy-moon-order-form";
const fields = [...form.querySelectorAll("input[name]")];

function readForm() {
 return Object.fromEntries(fields.map(field => [field.name, field.value]));
}

function fillForm(data) {
 for (const field of fields) {
  if (Object.hasOwn(data, field.name)) field.value = String(data[field.name] ?? "");
 }
}

function save() {
 try {
  localStorage.setItem(storageKey, JSON.stringify(readForm()));
  status.textContent = "Saved in this browser.";
 } catch (error) {
  status.textContent = `Could not save locally: ${error.message}`;
 }
}

try {
 const saved = localStorage.getItem(storageKey);
 if (saved) fillForm(JSON.parse(saved));
} catch (error) {
 status.textContent = `Could not load saved form: ${error.message}`;
}

form.addEventListener("input", save);

document.querySelector("#export").addEventListener("click", () => {
 const file = new Blob([JSON.stringify(readForm(), null, 2)], { type: "application/json" });
 const url = URL.createObjectURL(file);
 const link = document.createElement("a");
 link.href = url;
 link.download = "fairy-moon-order.json";
 link.click();
 URL.revokeObjectURL(url);
 status.textContent = "JSON exported.";
});

document.querySelector("#import").addEventListener("change", async event => {
 const file = event.target.files[0];
 if (!file) return;
 try {
  const data = JSON.parse(await file.text());
  if (!data || typeof data !== "object" || Array.isArray(data)) {
   throw new Error("Expected a JSON object of form fields.");
  }
  for (const [key, value] of Object.entries(data)) {
   if (fields.some(field => field.name === key) &&
    value !== null && typeof value !== "string" && typeof value !== "number") {
    throw new Error(`Invalid value for "${key}".`);
   }
  }
  fillForm(data);
  save();
  status.textContent = "JSON imported and saved in this browser.";
 } catch (error) {
  status.textContent = `Could not import JSON: ${error.message}`;
 } finally {
  event.target.value = "";
 }
});