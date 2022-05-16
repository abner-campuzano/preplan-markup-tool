function ModalComponent(){
    return <div className="modalBackground">
        <div className="modalContainer">
            <button>x</button>
            <div className="title">
                <h1>Confirmation</h1>
            </div>
            <div className="body">
                If you confirm, the marked up Preplan will be attached to the assignement in Workforce. 
            </div>
            <div className="footer">
            <button>Confirm</button>
            <button>Cancel</button>
            </div>
        </div>
    </div>;
}
export default ModalComponent;