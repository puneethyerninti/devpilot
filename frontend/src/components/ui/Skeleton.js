import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../LayoutHelpers';
const shapeStyles = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
};
const Skeleton = ({ shape = 'text', className, count = 1 }) => {
    const skeletonElement = (_jsx("div", { className: cn('skeleton bg-surface animate-pulse', shapeStyles[shape], className), "aria-hidden": "true" }));
    if (count === 1) {
        return skeletonElement;
    }
    return (_jsx("div", { className: "space-y-3", children: Array.from({ length: count }).map((_, i) => (_jsx("div", { children: skeletonElement }, i))) }));
};
export default Skeleton;
