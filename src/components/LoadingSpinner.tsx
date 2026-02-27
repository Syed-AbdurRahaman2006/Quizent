export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center justify-center p-8">
            <div
                className={`${sizeClasses[size]} border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin`}
            />
        </div>
    );
}
