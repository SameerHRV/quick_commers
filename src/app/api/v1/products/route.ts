import { db } from "@/lib/db/db";
import { products } from "@/lib/db/schema";
import { productSchema } from "@/lib/validators/product.schema";
import { desc } from "drizzle-orm";
import { writeFile } from "node:fs";
import path from "node:path";

export async function POST(request: Request) {
  // TODO: validate request of user
  const data = await request.formData();

  let validatesData;

  try {
    validatesData = productSchema.parse({
      name: data.get("name"),
      description: data.get("description"),
      price: Number(data.get("price")),
      image: data.get("image"),
    });
  } catch (error: any) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }

  const fileName = `${Date.now()}.${validatesData.image.name.split(".").slice(-1)}`;

  try {
    const buffer = Buffer.from(await validatesData.image.arrayBuffer());
    await writeFile(
      path.join(process.cwd(), "public/assets", fileName),
      buffer,
      { encoding: "utf-8" },
      (error: any) => {
        return Response.json(
          {
            message: error.message,
          },
          {
            status: 400,
          }
        );
      }
    );
  } catch (error: any) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }
  try {
    await db.insert(products).values({ ...validatesData, image: fileName });
  } catch (error: any) {
    //TODO: clear image file
    return Response.json(
      {
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }

  return Response.json(
    {
      message: "OK Product created successfully!!!",
    },
    {
      status: 201,
    }
  );
}

export async function GET() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.id));
    return Response.json(allProducts);
  } catch (error: any) {
    return Response.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
