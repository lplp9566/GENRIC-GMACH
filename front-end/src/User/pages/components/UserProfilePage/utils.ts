export const mapMembershipType = (type?: string | null) => {
  if (!type) return "לא הוזן";
  if (type === "MEMBER") return "חבר";
  if (type === "FRIEND") return "ידיד";
  return type;
};

export const buildFullDisplayName = (user?: {
  first_name?: string | null;
  last_name?: string | null;
  spouse_first_name?: string | null;
  spouse_last_name?: string | null;
}) => {
  const primaryFirstName = (user?.first_name ?? "").trim();
  const primaryLastName = (user?.last_name ?? "").trim();
  const spouseFirstName = (user?.spouse_first_name ?? "").trim();
  const spouseLastName = (user?.spouse_last_name ?? "").trim();

  if (!spouseFirstName) {
    return `${primaryFirstName} ${primaryLastName}`.trim();
  }

  if (spouseLastName && spouseLastName !== primaryLastName) {
    return `${primaryFirstName} ו${spouseFirstName} ${primaryLastName}/${spouseLastName}`.trim();
  }

  return `${primaryFirstName} ו${spouseFirstName} ${primaryLastName}`.trim();
};

