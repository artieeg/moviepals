import React from "react";

export async function Title({ invite_id }: { invite_id: string }) {
  const name = await fetch("https://api.moviepals.io/invite?code="+invite_id);

  if (name.ok) {
    const result = await name.json()

    return (
      <h1 className="font-primary text-neutral-1 dark:text-white text-2xl">
        {result.name} invited you to<br/>join MoviePals 👋🍿
      </h1>
    );
  } else {
    return (
      <h1 className="font-primary text-neutral-1 dark:text-white mt-8 text-3xl">
        Invite to join MoviePals
      </h1>
    );
  }
}
