import React from 'react'
import { createRoot } from 'react-dom/client';

function createPopWindows(title: string, message?: string, onClose?: Function): void {

    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);

    const root = createRoot(dialogRoot);

    const ConfirmDialog = () => {

        return (
            <div className="z-50 confirm-dialog-overlay flex justify-center fixed w-full top-44 left-1 right-1 px-4 pl-2">
                <div className="confirm-dialog w-[92%]">
                    <div className=' bg-stone-300 rounded-md rounded-b-none w-fit px-4 py-1 -mb-1 shadow-md shadow-stone-100 '><h1 className='text-xl underline decoration-stone-500'>{title}</h1></div>
                    <div className='bg-stone-300 rounded-tl-none rounded-md p-4 px-5 min-h-40 flex-col flex justify-between shadow-md shadow-stone-100'>
                        <pre className=' text-wrap whitespace-pre-wrap px-3'>{message}</pre>
                        <div className=' w-full flex justify-end space-x-4'>
                            <button className=' cursor-pointer px-2 rounded-full border-2 border-sotne-500 hover:bg-sotne-300' onClick={() => {
                                if (onClose) {
                                    onClose()
                                }
                                root.unmount();
                                document.body.removeChild(dialogRoot);
                            }}>close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    root.render(<ConfirmDialog />);
};

export default createPopWindows
