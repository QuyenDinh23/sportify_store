export const LoadingAnimation = ({ loading }) => {
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FAFAFA", // ✅ chú ý là backgroundColor chứ không phải background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };
  const spinnerStyle = {
    border: "6px solid #f3f3f3", // màu nền vòng tròn
    borderTop: "6px solid #F09342", // màu viền quay
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  };

  return (
    <>
      {loading ? (
        <>
          <div style={overlayStyle}>
            <div style={spinnerStyle}></div>
            <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
};
