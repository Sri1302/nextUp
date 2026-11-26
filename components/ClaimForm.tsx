// "Claim your page" bar: picks a handle, then starts YouTube (Google) sign-in.
export default function ClaimForm({ id }: { id?: string }) {
  return (
    <form className="claim" action="/auth/google" method="get" id={id}>
      <input type="hidden" name="intent" value="creator" />
      <label className="claim-field">
        <span className="claim-prefix">nextup/@</span>
        <input
          name="handle"
          placeholder="yourname"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={30}
          pattern="@?[A-Za-z0-9._]{3,30}"
          title="3–30 letters, numbers, dots or underscores"
          aria-label="Choose your NextUp handle"
        />
      </label>
      <button className="claim-btn">
        <span className="claim-long">Claim your page</span>
        <span className="claim-short">Claim</span> <span aria-hidden>→</span>
      </button>
    </form>
  );
}
