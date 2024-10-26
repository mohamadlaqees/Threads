"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";

export async function updateUser({ userId, bio, name, path, username, image }) {
  try {
    await connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId) {
  try {
    connectToDB();
    return await User.findOne({id:userId});

    // .populate({
    //   path: "communities",
    //   model: Community,
    // });
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
