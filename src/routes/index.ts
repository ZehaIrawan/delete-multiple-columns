import express from "express";
const router = express.Router();
import mondayRoutes from "./monday";
// import fetch from 'node-fetch';
import axios from "axios";

router.use(mondayRoutes);

// serve client app
router.use(express.static("client/dist"));

router.get("/", function (req, res) {
  res.sendFile("index.html", { root: "client/dist" });
});

router.get("/health", function (req, res) {
  res.send(getHealth());
});

router.post("/webhook", function (req, res) {
  // Handle webhook payload here
  const payload = req.body; // Assuming the payload is in JSON format
  // console.log('Received webhook payload:', payload);
  res.status(200).end();
  if (payload.type === "install") {
    // subscribe(payload.data);
    updateUser(payload.data);
  } else if (payload.type === "uninstall") {
    // unsubscribe(payload.data);
  }
});

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;

const baseURL = "https://api.getturboflow.com";

function updateUser(payload) {
  try {
    fetch(`${baseURL}/marketplace_users/${payload.account_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: payload.user_email,
        user_name: payload.user_name,
        other_data: payload,
        account_id: payload.account_id,
      }),
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

const subscribe = (data) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.user_email,
      firstName: data.user_name.split(" ")[0],
      lastName: data.user_name.split(" ")[1],
      app_id: data.app_id,
      user_id: data.user_id,
      user_country: data.user_country,
    }),
  };

  fetch("https://app.loops.so/api/v1/contacts/create", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
};

const unsubscribe = (data) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: data.user_email,
    }),
  };

  fetch("https://app.loops.so/api/v1/contacts/delete", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
};

function getHealth() {
  return {
    ok: true,
    message: "Healthy",
  };
}

// Check if a marketplace user exists
router.get(
  "/marketplace_users/:account_id/check_existence",
  async (req, res) => {
    const account_id = req.params.account_id;

    try {
      // Send request to external API to check user existence
      const response = await axios.get(
        `${baseURL}/marketplace_users/${account_id}/check_existence`,
      );

      res.json(response.data);
    } catch (error) {
      // Handle errors
      if (error.response) {
        // The request was made and the server responded with a status code
        res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        res
          .status(500)
          .json({ error: "No response received from external API" });
      } else {
        // Other errors
        res.status(500).json({ error: "Internal server error" });
      }
    }
  },
);

// Create a new marketplace user
router.post("/marketplace_users", async (req, res) => {
  try {
    // Extract data from request body
    const { account_id, user_marketplace_id, marketplace_name } = req.body;

    // Send POST request to external API to create a new marketplace user
    const response = await axios.post(`${baseURL}/marketplace_users`, {
      account_id,
      user_marketplace_id,
      marketplace_name,
    });

    // Return the response from the external API
    res.json(response.data);
  } catch (error) {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ error: "No response received from external API" });
    } else {
      // Other errors
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Check user credit
router.get("/marketplace_users/check_credit/:account_id", async (req, res) => {
  const account_id = req.params.account_id;

  try {
    // Send request to external API to check user existence
    const response = await axios.get(
      `${baseURL}/marketplace_users/check_credit/${account_id}`,
    );

    res.json(response.data);
  } catch (error) {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ error: "No response received from external API" });
    } else {
      // Other errors
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// decrease credit
router.patch(
  "/marketplace_users/:account_id/decrease_credit",
  async (req, res) => {
    const account_id = req.params.account_id;
    const decreaseBy = req.body.decrease_by;

    try {
      const response = await fetch(
        `${baseURL}/marketplace_users/${account_id}/decrease_credit`,
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
      res.json(data);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get profile data
router.get("/person_profile", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL query parameter is required" });
  }

  try {
    const response = await axios.get(`${baseURL}/person_profile`, {
      params: { url },
    });

    // console.log(response.data, "response");

    res.json(response.data);
  } catch (error) {
    console.log(error, "error");
  }
});

// Person search
router.get("/person_search", async (req, res) => {
  const { current_role_title, city, country } = req.query;

  // Validate required query parameters
  if (!current_role_title || !city || !country) {
    return res.status(400).json({
      error:
        "Query parameters current_role_title, city, and country are required",
    });
  }

  try {
    const response = await axios.get(`${baseURL}/person_search`, {
      params: { current_role_title, city, country },
    });

    res.json(response.data);
  } catch (error) {
    // Handle errors
    console.error(error);
  }
});

export default router;
