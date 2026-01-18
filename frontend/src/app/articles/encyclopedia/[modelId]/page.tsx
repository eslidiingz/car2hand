import React from 'react';

export default function ModelDetailPage({ params }: { params: { modelId: string } }) {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Model Detail</h1>
            <p>In-depth info for model ID: {params.modelId}</p>
        </div>
    );
}
