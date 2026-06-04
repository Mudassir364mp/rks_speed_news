import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Article from '@/models/Article';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const article = await Article.findById(id);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, article });
    } catch (error) {
        console.error('GET article by ID error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const { title, excerpt, content, category, author, imageUrl, status } = body;

        if (!title || !excerpt || !content || !author) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const updated = await Article.findByIdAndUpdate(
            id,
            {
                title,
                excerpt,
                content,
                categoryId: category,
                author,
                imageUrl,
                status,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, article: updated });
    } catch (error) {
        console.error('PUT article error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}