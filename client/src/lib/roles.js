export function normalizeRole(role) {
  if (role === "patient") return "user";
  if (role === "admin") return "staff";
  return role;
}
