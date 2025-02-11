"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export async function createThread(dataObj) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text: dataObj.text,
      author: dataObj.author,
      community: dataObj.community || null,
    });

    await User.findByIdAndUpdate(dataObj.author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(dataObj.path);
  } catch (error) {
    throw new Error(`Error creating thread : ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    // .populate({
    //   path: "community",
    //   model: Community,
    // })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id) {
  try {
    connectToDB();

    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error) {
    throw new Error(`Error fetching thread ${error.message}`);
  }
}

export async function addCommentToThread(threadId, commentText, userId, path) {
  try {
    connectToDB();

    const thread = await Thread.findById(threadId);

    if (!thread) {
      throw new Error("Thread  not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    thread.children.push(savedCommentThread._id);

    await thread.save();

    revalidatePath(path);
  } catch (error) {
    throw new Error(`Error fetching thread ${error.message}`);
  }
}
