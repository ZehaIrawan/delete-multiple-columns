export async function decreaseUserCredit(account_id, decreaseBy) {
  try {
    const response = await fetch(
      `/marketplace_users/${account_id}/decrease_credit`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decrease_by: decreaseBy,
        }),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function checkUserCredit(account_id) {
  try {
    const response = await fetch(
      `/marketplace_users/check_credit/${account_id}`,
    );
    const data = await response.json();
    return data.credits;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function createUser(account_id, marketplaceName, user_id) {
  try {
    const response = await fetch("/marketplace_users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_id: account_id,
        marketplace_name:marketplaceName,
        user_marketplace_id: user_id,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
}

export async function checkUserExist(accountId) {
  try {
    const response = await fetch(
      `/marketplace_users/${accountId}/check_existence`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
}
