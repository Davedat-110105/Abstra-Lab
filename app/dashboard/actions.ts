"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard/resources");
  revalidatePath("/dashboard/posts");
  revalidatePath("/dashboard/staff");
}

async function guardStaff() {
  const staff = await requireStaff();
  if (!staff) redirect("/accounts/login");
  return staff;
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/* ── Posts ── */

export async function createPost(formData: FormData) {
  const staff = await guardStaff();
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(title);
  if (!title || !slug) return;
  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: String(formData.get("excerpt") || ""),
      content: String(formData.get("content") || ""),
      featuredImage: String(formData.get("featuredImage") || "") || null,
      published: bool(formData, "published"),
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  revalidatePath("/posts");
  redirect("/dashboard/staff");
}

export async function updatePost(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  const title = String(formData.get("title") || "").trim();
  if (!id || !title) return;
  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      excerpt: String(formData.get("excerpt") || ""),
      content: String(formData.get("content") || ""),
      featuredImage: String(formData.get("featuredImage") || "") || null,
      published: bool(formData, "published"),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  revalidatePath("/posts");
  redirect("/dashboard/staff");
}

export async function deletePost(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  if (!id) return;
  await prisma.blogPost.delete({ where: { id } });
  revalidateDashboard();
  revalidatePath("/posts");
  redirect("/dashboard/staff");
}

/* ── Events ── */

export async function createEvent(formData: FormData) {
  const staff = await guardStaff();
  const title = String(formData.get("title") || "").trim();
  const slug = slugify(title);
  if (!title || !slug) return;
  await prisma.clubEvent.create({
    data: {
      title,
      slug,
      dateLabel: String(formData.get("dateLabel") || "Upcoming"),
      summary: String(formData.get("summary") || ""),
      description: String(formData.get("description") || ""),
      location: String(formData.get("location") || ""),
      image: String(formData.get("image") || "") || null,
      published: bool(formData, "published"),
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  revalidatePath("/events");
  redirect("/dashboard/staff");
}

export async function updateEvent(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  const title = String(formData.get("title") || "").trim();
  if (!id || !title) return;
  await prisma.clubEvent.update({
    where: { id },
    data: {
      title,
      dateLabel: String(formData.get("dateLabel") || "Upcoming"),
      summary: String(formData.get("summary") || ""),
      description: String(formData.get("description") || ""),
      location: String(formData.get("location") || ""),
      image: String(formData.get("image") || "") || null,
      published: bool(formData, "published"),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  revalidatePath("/events");
  redirect("/dashboard/staff");
}

export async function deleteEvent(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  if (!id) return;
  await prisma.clubEvent.delete({ where: { id } });
  revalidateDashboard();
  revalidatePath("/events");
  redirect("/dashboard/staff");
}

/* ── Resources ── */

export async function createMaterial(formData: FormData) {
  const staff = await guardStaff();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await prisma.buildMaterial.create({
    data: {
      materialType: String(formData.get("materialType") || "hardware"),
      name,
      summary: String(formData.get("summary") || ""),
      usedFor: String(formData.get("usedFor") || ""),
      access: String(formData.get("access") || ""),
      urlName: "",
      dashboardSection: "",
      accessLabel: "",
      purchaseUrl: String(formData.get("purchaseUrl") || ""),
      published: bool(formData, "published"),
      sortOrder: Number(formData.get("sortOrder") || 0),
      authorId: staff.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  redirect("/dashboard/staff");
}

export async function updateMaterial(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  await prisma.buildMaterial.update({
    where: { id },
    data: {
      materialType: String(formData.get("materialType") || "hardware"),
      name,
      summary: String(formData.get("summary") || ""),
      usedFor: String(formData.get("usedFor") || ""),
      access: String(formData.get("access") || ""),
      purchaseUrl: String(formData.get("purchaseUrl") || ""),
      published: bool(formData, "published"),
      sortOrder: Number(formData.get("sortOrder") || 0),
      updatedAt: new Date(),
    },
  });
  revalidateDashboard();
  redirect("/dashboard/staff");
}

export async function deleteMaterial(formData: FormData) {
  await guardStaff();
  const id = BigInt(String(formData.get("id") || "0"));
  if (!id) return;
  await prisma.buildMaterial.delete({ where: { id } });
  revalidateDashboard();
  redirect("/dashboard/staff");
}

/* ── Members ── */

export async function approveMember(formData: FormData) {
  await guardStaff();
  await prisma.user.update({
    where: { id: Number(formData.get("userId")) },
    data: { isActive: true },
  });
  revalidateDashboard();
}

export async function deactivateMember(formData: FormData) {
  await guardStaff();
  const userId = Number(formData.get("userId"));
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
  revalidateDashboard();
}
